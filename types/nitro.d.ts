import type { Sequelize } from 'sequelize';

declare module 'nitropack' {
    interface NitroApp {
        sequelize: Sequelize;
    }
}