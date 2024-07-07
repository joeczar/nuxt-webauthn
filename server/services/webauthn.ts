import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    type VerifiedAuthenticationResponse,
    type VerifiedRegistrationResponse, GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import {
    AuthenticationResponseJSON, AuthenticatorTransportFuture,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON
} from "@simplewebauthn/types";


const rpName = process.env.RP_ID || 'Your App Name';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.ORIGIN || `http://${rpID}:3000`;

export async function generateRegistrationOptionsForUser(email: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const { prisma } = useNitroApp()

    console.log("webauthn", {email})
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        user = await prisma.user.create({
            data: { email }
        });
    }

    console.log("User before options generation:", {
        id: user.id,
        email: user.email,
        currentChallenge: user.currentChallenge
    });

    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: Uint8Array.from(Buffer.from(user.id, 'utf-8')),
        userName: user.email,
        attestationType: 'none',
        authenticatorSelection: {
            userVerification: 'preferred',
        }
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { currentChallenge: options.challenge }
    });

    console.log("User after update:", await prisma.user.findUnique({ where: { id: user.id } }));

    return options;
}

export async function verifyRegistrationForUser(email: string, response: RegistrationResponseJSON): Promise<VerifiedRegistrationResponse> {
    const { prisma } = useNitroApp()
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("Verification - User found:", !!user);
    console.log("Verification - User details:", user);

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

    const user = await prisma.user.findUnique({
        where: { email },
        include: { credentials: true },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: user.credentials?.map(cred => ({
            id: cred.id,
            transports: cred.transports as AuthenticatorTransportFuture[] | undefined,
        })) || [],
        userVerification: 'preferred',
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { currentChallenge: options.challenge }
    });

    return options;
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

    const credential = user.credentials?.find(c => c.id === response.id);
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
