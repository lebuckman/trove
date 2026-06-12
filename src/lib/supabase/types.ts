// Hand-typed DB type for v1. Once the schema settles, regenerate with:
//   npm run types
// (requires the Supabase CLI and a linked project)

export type GemType = "image" | "video" | "link";

export type Database = {
  trove: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["trove"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      troves: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          cover_gem_id: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          cover_gem_id?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["trove"]["Tables"]["troves"]["Insert"]>;
        Relationships: [];
      };
      gems: {
        Row: {
          id: string;
          trove_id: string;
          user_id: string;
          type: GemType;
          storage_path: string | null;
          mime_type: string | null;
          url: string | null;
          description: string | null;
          og_title: string | null;
          og_description: string | null;
          og_thumbnail_url: string | null;
          og_site_name: string | null;
          width: number | null;
          height: number | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          trove_id: string;
          user_id: string;
          type: GemType;
          storage_path?: string | null;
          mime_type?: string | null;
          url?: string | null;
          description?: string | null;
          og_title?: string | null;
          og_description?: string | null;
          og_thumbnail_url?: string | null;
          og_site_name?: string | null;
          width?: number | null;
          height?: number | null;
          position?: number;
          created_at?: string;
        };
        Update: Partial<Database["trove"]["Tables"]["gems"]["Insert"]>;
        Relationships: [];
      };
      tags: {
        Row: { id: string; user_id: string; name: string };
        Insert: { id?: string; user_id: string; name: string };
        Update: Partial<{ id: string; user_id: string; name: string }>;
        Relationships: [];
      };
      gem_tags: {
        Row: { gem_id: string; tag_id: string };
        Insert: { gem_id: string; tag_id: string };
        Update: Partial<{ gem_id: string; tag_id: string }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { gem_type: GemType };
    CompositeTypes: Record<string, never>;
  };
};
