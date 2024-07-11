    import {
        generateRegistrationOptions,
        verifyRegistrationResponse,
        generateAuthenticationOptions,
        verifyAuthenticationResponse,
        type VerifiedAuthenticationResponse,
        type VerifiedRegistrationResponse,
    } from '@simplewebauthn/server';
    import type {
        AuthenticationResponseJSON, AuthenticatorTransportFuture,
        PublicKeyCredentialRequestOptionsJSON,
        RegistrationResponseJSON
    } from "@simplewebauthn/types";
    import {H3Error} from "h3";

    const rpName = process.env.RP_ID || 'Your App Name';
    const rpID = process.env.RP_ID || 'localhost';
    const origin = process.env.ORIGIN || `http://${rpID}:3000`;

    export async function generateRegistrationOptionsForUser(email: string) {
        const { prisma } = useNitroApp()
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.isEmailVerified) {
            throw new Error('Email not verified');
        }

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: Buffer.from(user.id, 'base64'),
            userName: user.email,
            attestationType: 'none',
            authenticatorSelection: {
                userVerification: 'preferred',
            },
        });

        await prisma.user.update({
            where: { id: user.id },
            data: { currentChallenge: options.challenge }
        });

        return options;
    }

    export async function verifyRegistrationForUser(email: string, response: RegistrationResponseJSON): Promise<VerifiedRegistrationResponse> {
        const { prisma } = useNitroApp()
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.currentChallenge) {
            throw new Error('User not found or challenge not set');
        }

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified && verification.registrationInfo) {
            await prisma.credential.create({
                data: {
                    id: verification.registrationInfo.credentialID.toString(),
                    userId: user.id,
                    publicKey: Buffer.from(verification.registrationInfo.credentialPublicKey),
                    counter: verification.registrationInfo.counter,
                }
            });

            await prisma.user.update({
                where: { id: user.id },
                data: { currentChallenge: null }
            });
        }

        return verification;
    }

    export async function generateAuthenticationOptionsForUser(email: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
        const { prisma } = useNitroApp()
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { email },
                include: { credentials: true },
            });
        } catch (dbError) {
            if (dbError instanceof H3Error) {
                console.error("Database error when finding user:", dbError);
                throw new Error(`Database error: ${dbError.message}`);
            }
            console.error("Error in login handler:", dbError);
        }

        if (!user) {
            throw new Error(`User not found for email: ${email}`);
        }
        if (!user.credentials || user.credentials.length === 0) {
            throw new Error(`No credentials found for user: ${email}`);
        }

        try {
            const options = await generateAuthenticationOptions({
                rpID,
                allowCredentials: user.credentials.map((cred) => ({
                    id:cred.id,
                    type: 'public-key' as const,
                    transports: cred.transports as AuthenticatorTransportFuture[] | undefined,
                })),
                userVerification: 'preferred',
            });

            await prisma.user.update({
                where: { id: user.id },
                data: { currentChallenge: options.challenge }
            });

            return options;
        } catch (error) {
            console.error("Error in generateAuthenticationOptions:", error);
            throw error;
        }
    }

    export async function verifyAuthenticationForUser(email: string, response: AuthenticationResponseJSON): Promise<VerifiedAuthenticationResponse> {
        const { prisma } = useNitroApp()
        const user = await prisma.user.findUnique({
            where: { email },
            include: { credentials: true },
        });

        if (!user || !user.currentChallenge) {
            throw new Error('User not found or challenge not set');
        }

        const credential = user.credentials.find((c) => c.id === response.id);
        if (!credential) {
            throw new Error('Credential not found');
        }

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialPublicKey: credential.publicKey,
                credentialID: credential.id,
                counter: credential.counter,
            },
        });

        if (verification.verified) {
            await prisma.credential.update({
                where: { id: credential.id },
                data: { counter: verification.authenticationInfo.newCounter }
            });

            await prisma.user.update({
                where: { id: user.id },
                data: { currentChallenge: null }
            });
        }

        return verification;
    }
