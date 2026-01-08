export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      budgets_mensuels: {
        Row: {
          annee: number
          charges_fixes_prevues: number | null
          charges_fixes_reelles: number | null
          created_at: string | null
          depenses_variables_prevues: number | null
          depenses_variables_reelles: number | null
          epargne_prevue: number | null
          epargne_reelle: number | null
          id: string
          mois: number
          revenus_prevus: number | null
          revenus_reels: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annee: number
          charges_fixes_prevues?: number | null
          charges_fixes_reelles?: number | null
          created_at?: string | null
          depenses_variables_prevues?: number | null
          depenses_variables_reelles?: number | null
          epargne_prevue?: number | null
          epargne_reelle?: number | null
          id?: string
          mois: number
          revenus_prevus?: number | null
          revenus_reels?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annee?: number
          charges_fixes_prevues?: number | null
          charges_fixes_reelles?: number | null
          created_at?: string | null
          depenses_variables_prevues?: number | null
          depenses_variables_reelles?: number | null
          epargne_prevue?: number | null
          epargne_reelle?: number | null
          id?: string
          mois?: number
          revenus_prevus?: number | null
          revenus_reels?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_mensuels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_mensuels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "budgets_mensuels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categories: {
        Row: {
          budget_mensuel: number | null
          couleur: string | null
          created_at: string | null
          est_actif: boolean | null
          est_fixe: boolean | null
          icone: string | null
          id: string
          nom: string
          ordre: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_mensuel?: number | null
          couleur?: string | null
          created_at?: string | null
          est_actif?: boolean | null
          est_fixe?: boolean | null
          icone?: string | null
          id?: string
          nom: string
          ordre?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_mensuel?: number | null
          couleur?: string | null
          created_at?: string | null
          est_actif?: boolean | null
          est_fixe?: boolean | null
          icone?: string | null
          id?: string
          nom?: string
          ordre?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
      charges_fixes: {
        Row: {
          categorie_id: string | null
          compte_id: string | null
          couleur: string | null
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          est_actif: boolean | null
          frequence: string | null
          icone: string | null
          id: string
          jour_prelevement: number | null
          montant: number
          nom: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categorie_id?: string | null
          compte_id?: string | null
          couleur?: string | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          est_actif?: boolean | null
          frequence?: string | null
          icone?: string | null
          id?: string
          jour_prelevement?: number | null
          montant: number
          nom: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categorie_id?: string | null
          compte_id?: string | null
          couleur?: string | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          est_actif?: boolean | null
          frequence?: string | null
          icone?: string | null
          id?: string
          jour_prelevement?: number | null
          montant?: number
          nom?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "charges_fixes_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_fixes_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "v_depenses_par_categorie"
            referencedColumns: ["categorie_id"]
          },
          {
            foreignKeyName: "charges_fixes_compte_id_fkey"
            columns: ["compte_id"]
            isOneToOne: false
            referencedRelation: "comptes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_fixes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_fixes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "charges_fixes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
      comptes: {
        Row: {
          banque: string | null
          couleur: string | null
          created_at: string | null
          est_actif: boolean | null
          icone: string | null
          id: string
          nom: string
          ordre: number | null
          solde: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          banque?: string | null
          couleur?: string | null
          created_at?: string | null
          est_actif?: boolean | null
          icone?: string | null
          id?: string
          nom: string
          ordre?: number | null
          solde?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          banque?: string | null
          couleur?: string | null
          created_at?: string | null
          est_actif?: boolean | null
          icone?: string | null
          id?: string
          nom?: string
          ordre?: number | null
          solde?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comptes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comptes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comptes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dettes: {
        Row: {
          capital_initial: number
          capital_restant: number
          compte_id: string | null
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          id: string
          image_url: string | null
          jour_prelevement: number | null
          mensualite: number
          nom: string
          nombre_echeances_restantes: number | null
          notes: string | null
          preteur: string | null
          taux_interet: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capital_initial: number
          capital_restant: number
          compte_id?: string | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          image_url?: string | null
          jour_prelevement?: number | null
          mensualite: number
          nom: string
          nombre_echeances_restantes?: number | null
          notes?: string | null
          preteur?: string | null
          taux_interet?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capital_initial?: number
          capital_restant?: number
          compte_id?: string | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          image_url?: string | null
          jour_prelevement?: number | null
          mensualite?: number
          nom?: string
          nombre_echeances_restantes?: number | null
          notes?: string | null
          preteur?: string | null
          taux_interet?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dettes_compte_id_fkey"
            columns: ["compte_id"]
            isOneToOne: false
            referencedRelation: "comptes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dettes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dettes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "dettes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
      historique_soldes: {
        Row: {
          created_at: string | null
          date_snapshot: string
          id: string
          total_actifs: number | null
          total_dettes: number | null
          total_investissements: number | null
          total_liquidites: number | null
          user_id: string
          valeur_nette: number | null
        }
        Insert: {
          created_at?: string | null
          date_snapshot: string
          id?: string
          total_actifs?: number | null
          total_dettes?: number | null
          total_investissements?: number | null
          total_liquidites?: number | null
          user_id: string
          valeur_nette?: number | null
        }
        Update: {
          created_at?: string | null
          date_snapshot?: string
          id?: string
          total_actifs?: number | null
          total_dettes?: number | null
          total_investissements?: number | null
          total_liquidites?: number | null
          user_id?: string
          valeur_nette?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historique_soldes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historique_soldes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "historique_soldes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
      investissements: {
        Row: {
          created_at: string | null
          date_achat: string | null
          devise: string | null
          id: string
          image_url: string | null
          nom: string
          notes: string | null
          plateforme: string | null
          plus_value: number | null
          prix_achat_unitaire: number | null
          prix_actuel: number | null
          quantite: number | null
          ticker: string | null
          type: string
          updated_at: string | null
          user_id: string
          valeur_actuelle: number | null
        }
        Insert: {
          created_at?: string | null
          date_achat?: string | null
          devise?: string | null
          id?: string
          image_url?: string | null
          nom: string
          notes?: string | null
          plateforme?: string | null
          plus_value?: number | null
          prix_achat_unitaire?: number | null
          prix_actuel?: number | null
          quantite?: number | null
          ticker?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          valeur_actuelle?: number | null
        }
        Update: {
          created_at?: string | null
          date_achat?: string | null
          devise?: string | null
          id?: string
          image_url?: string | null
          nom?: string
          notes?: string | null
          plateforme?: string | null
          plus_value?: number | null
          prix_achat_unitaire?: number | null
          prix_actuel?: number | null
          quantite?: number | null
          ticker?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          valeur_actuelle?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "investissements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investissements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "investissements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
      objectifs: {
        Row: {
          compte_id: string | null
          couleur: string | null
          created_at: string | null
          date_cible: string | null
          est_atteint: boolean | null
          icone: string | null
          id: string
          montant_actuel: number | null
          montant_cible: number
          nom: string
          notes: string | null
          priorite: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compte_id?: string | null
          couleur?: string | null
          created_at?: string | null
          date_cible?: string | null
          est_atteint?: boolean | null
          icone?: string | null
          id?: string
          montant_actuel?: number | null
          montant_cible: number
          nom: string
          notes?: string | null
          priorite?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compte_id?: string | null
          couleur?: string | null
          created_at?: string | null
          date_cible?: string | null
          est_atteint?: boolean | null
          icone?: string | null
          id?: string
          montant_actuel?: number | null
          montant_cible?: number
          nom?: string
          notes?: string | null
          priorite?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "objectifs_compte_id_fkey"
            columns: ["compte_id"]
            isOneToOne: false
            referencedRelation: "comptes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectifs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectifs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "objectifs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          devise: string | null
          email: string
          id: string
          mode_gestion: string | null
          nom: string | null
          objectif_epargne: number | null
          prenom: string | null
          revenus_mensuels: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          devise?: string | null
          email: string
          id: string
          mode_gestion?: string | null
          nom?: string | null
          objectif_epargne?: number | null
          prenom?: string | null
          revenus_mensuels?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          devise?: string | null
          email?: string
          id?: string
          mode_gestion?: string | null
          nom?: string | null
          objectif_epargne?: number | null
          prenom?: string | null
          revenus_mensuels?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          categorie_id: string | null
          charge_fixe_id: string | null
          compte_id: string | null
          created_at: string | null
          date_transaction: string
          description: string | null
          est_recurrent: boolean | null
          id: string
          montant: number
          notes: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categorie_id?: string | null
          charge_fixe_id?: string | null
          compte_id?: string | null
          created_at?: string | null
          date_transaction?: string
          description?: string | null
          est_recurrent?: boolean | null
          id?: string
          montant: number
          notes?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categorie_id?: string | null
          charge_fixe_id?: string | null
          compte_id?: string | null
          created_at?: string | null
          date_transaction?: string
          description?: string | null
          est_recurrent?: boolean | null
          id?: string
          montant?: number
          notes?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "v_depenses_par_categorie"
            referencedColumns: ["categorie_id"]
          },
          {
            foreignKeyName: "transactions_charge_fixe_id_fkey"
            columns: ["charge_fixe_id"]
            isOneToOne: false
            referencedRelation: "charges_fixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_compte_id_fkey"
            columns: ["compte_id"]
            isOneToOne: false
            referencedRelation: "comptes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      v_depenses_par_categorie: {
        Row: {
          budget_mensuel: number | null
          categorie_id: string | null
          categorie_nom: string | null
          couleur: string | null
          icone: string | null
          mois: string | null
          pourcentage_budget: number | null
          total_depense: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_patrimoine_total"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_resume_mensuel"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_patrimoine_total: {
        Row: {
          total_dettes: number | null
          total_investissements: number | null
          total_liquidites: number | null
          user_id: string | null
          valeur_nette: number | null
        }
        Insert: {
          total_dettes?: never
          total_investissements?: never
          total_liquidites?: never
          user_id?: string | null
          valeur_nette?: never
        }
        Update: {
          total_dettes?: never
          total_investissements?: never
          total_liquidites?: never
          user_id?: string | null
          valeur_nette?: never
        }
        Relationships: []
      }
      v_resume_mensuel: {
        Row: {
          charges_fixes: number | null
          depenses_variables: number | null
          mois: string | null
          revenus: number | null
          total_depenses: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_default_categories: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_monthly_snapshot: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Convenient type aliases
export type Profile = Tables<"profiles">
export type Compte = Tables<"comptes">
export type Categorie = Tables<"categories">
export type ChargeFix = Tables<"charges_fixes">
export type Transaction = Tables<"transactions">
export type Investissement = Tables<"investissements">
export type Dette = Tables<"dettes">
export type HistoriqueSolde = Tables<"historique_soldes">
export type Objectif = Tables<"objectifs">
export type BudgetMensuel = Tables<"budgets_mensuels">
