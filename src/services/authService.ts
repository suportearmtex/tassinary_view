import { SupabaseClient } from "../config/supabase";

export class AuthService {
    private supabaseClient = SupabaseClient;


    async signUp(email: string, password: string) {
        const { data, error } = await this.supabaseClient.auth.signUp({
            email,
            password
        });
        return { data, error };
    }

    async signOut() {
        const { error } = await this.supabaseClient.auth.signOut();
        return { error };
    }

    async createUser() {
        const { data, error } = await this.supabaseClient.auth.admin.createUser({
            email: 'institutojoaotassinary@gmail.com',
            password: 'Ijt.12345678',
            app_metadata: {
                role: 'n8n_tassinary.aooyzdtujeaytavlykpj'
            }
        })
        return { data, error };
    }
}