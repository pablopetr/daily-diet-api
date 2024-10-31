import { Knex } from "knex";

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string;
            name: string;
            email: string;
            session_id: string;
            created_at: string;
            updated_at: string;
        },
        meal: {
            id: string;
            name: string;
            description: string;
            datetime: string;
            in_diet: boolean;
            user_id: string;
        }
    }
}