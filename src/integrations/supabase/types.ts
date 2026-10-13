export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      alertas: {
        Row: {
          created_at: string
          destinatario: string | null
          enlace: string | null
          id: string
          mensaje: string
          tipo: string
        }
        Insert: {
          created_at?: string
          destinatario?: string | null
          enlace?: string | null
          id?: string
          mensaje: string
          tipo: string
        }
        Update: {
          created_at?: string
          destinatario?: string | null
          enlace?: string | null
          id?: string
          mensaje?: string
          tipo?: string
        }
        Relationships: []
      }
      componentes: {
        Row: {
          estado: string
          id: string
          maquina_id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          estado?: string
          id?: string
          maquina_id: string
          nombre: string
          updated_at?: string
        }
        Update: {
          estado?: string
          id?: string
          maquina_id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "componentes_maquina_id_fkey"
            columns: ["maquina_id"]
            isOneToOne: false
            referencedRelation: "maquinas"
            referencedColumns: ["id"]
          },
        ]
      }
      contactos: {
        Row: {
          created_at: string
          email: string
          empresa: string
          id: string
          mensaje: string
          nombre: string
        }
        Insert: {
          created_at?: string
          email: string
          empresa: string
          id?: string
          mensaje: string
          nombre: string
        }
        Update: {
          created_at?: string
          email?: string
          empresa?: string
          id?: string
          mensaje?: string
          nombre?: string
        }
        Relationships: []
      }
      lecturas: {
        Row: {
          fecha: string
          id: number
          maquina_id: string
          presion: number
          temperatura: number
          vibracion: number
        }
        Insert: {
          fecha: string
          id?: number
          maquina_id: string
          presion: number
          temperatura: number
          vibracion: number
        }
        Update: {
          fecha?: string
          id?: number
          maquina_id?: string
          presion?: number
          temperatura?: number
          vibracion?: number
        }
        Relationships: [
          {
            foreignKeyName: "lecturas_maquina_id_fkey"
            columns: ["maquina_id"]
            isOneToOne: false
            referencedRelation: "maquinas"
            referencedColumns: ["id"]
          },
        ]
      }
      maquinas: {
        Row: {
          area: string
          created_at: string
          id: string
          modelo: string
          nombre: string
          numero_serie: string
          proxima_revision: string | null
          ubicacion: string
          ultima_revision: string | null
          umbral_temperatura: number
          umbral_vibracion: number
        }
        Insert: {
          area: string
          created_at?: string
          id?: string
          modelo: string
          nombre: string
          numero_serie: string
          proxima_revision?: string | null
          ubicacion: string
          ultima_revision?: string | null
          umbral_temperatura?: number
          umbral_vibracion?: number
        }
        Update: {
          area?: string
          created_at?: string
          id?: string
          modelo?: string
          nombre?: string
          numero_serie?: string
          proxima_revision?: string | null
          ubicacion?: string
          ultima_revision?: string | null
          umbral_temperatura?: number
          umbral_vibracion?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          nombre?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      servicios: {
        Row: {
          componente_id: string | null
          fecha: string
          id: string
          maquina_id: string
          resultado: string
          solicitud_id: string | null
          tecnico_id: string | null
          tiempo_paro_min: number
          trabajo: string
          turno: string
        }
        Insert: {
          componente_id?: string | null
          fecha?: string
          id?: string
          maquina_id: string
          resultado: string
          solicitud_id?: string | null
          tecnico_id?: string | null
          tiempo_paro_min?: number
          trabajo: string
          turno: string
        }
        Update: {
          componente_id?: string | null
          fecha?: string
          id?: string
          maquina_id?: string
          resultado?: string
          solicitud_id?: string | null
          tecnico_id?: string | null
          tiempo_paro_min?: number
          trabajo?: string
          turno?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicios_componente_id_fkey"
            columns: ["componente_id"]
            isOneToOne: false
            referencedRelation: "componentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicios_maquina_id_fkey"
            columns: ["maquina_id"]
            isOneToOne: false
            referencedRelation: "maquinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicios_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: false
            referencedRelation: "solicitudes"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitudes: {
        Row: {
          componente_id: string | null
          creado_por: string | null
          created_at: string
          descripcion: string
          estado: string
          folio: number
          foto_url: string | null
          id: string
          maquina_id: string
          prioridad: string
          tecnico_id: string | null
          tiempo_paro_min: number | null
          turno: string
          updated_at: string
        }
        Insert: {
          componente_id?: string | null
          creado_por?: string | null
          created_at?: string
          descripcion: string
          estado?: string
          folio?: number
          foto_url?: string | null
          id?: string
          maquina_id: string
          prioridad: string
          tecnico_id?: string | null
          tiempo_paro_min?: number | null
          turno: string
          updated_at?: string
        }
        Update: {
          componente_id?: string | null
          creado_por?: string | null
          created_at?: string
          descripcion?: string
          estado?: string
          folio?: number
          foto_url?: string | null
          id?: string
          maquina_id?: string
          prioridad?: string
          tecnico_id?: string | null
          tiempo_paro_min?: number | null
          turno?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_componente_id_fkey"
            columns: ["componente_id"]
            isOneToOne: false
            referencedRelation: "componentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_maquina_id_fkey"
            columns: ["maquina_id"]
            isOneToOne: false
            referencedRelation: "maquinas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      es_personal: { Args: { _uid: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "operador" | "tecnico" | "supervisor"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["operador", "tecnico", "supervisor"],
    },
  },
} as const
