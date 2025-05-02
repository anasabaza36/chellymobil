/* ──────────────────────────────────────────────────────────────────
   TYPES « métier »
   ──────────────────────────────────────────────────────────────────*/

// ── Activité (version “lite” suffisante pour l’affichage des perfs)
export interface ActiviteDTO {
  id: number;
  nom: string;
  lieu?: string;
  description?: string;
  // ➜ ajoute d’autres champs si besoin (prix, imageBase64, …)
}

// ── Horaire d’entraînement / créneau
export interface HoraireDTO {
  id: number;
  nom: string;
  lieu: string;
}

// ── Paiement d’adhésion / cotisation
export interface PaiementDTO {
  id: number;
  date: string;            // ISO 8601
  montant: number;
  statut: 'PAID' | 'PENDING' | 'CANCELLED' | string;
}

// ── Performance sportive
export interface PerformanceDTO {
  id: number;
  date: string;            // ISO 8601
  note: number;            // 0-10 ou 0-100 selon ton domaine
  commentaire?: string;

  /**  Activité à laquelle se rattache la performance */
  activite: ActiviteDTO;
}

/* ──────────────────────────────────────────────────────────────────
   TYPE PRINCIPAL : AdherentDTO
   ──────────────────────────────────────────────────────────────────*/

export interface AdherentDTO {
  /* ── Identité ──────────────────────────────────────────────── */
  id: number;
  nom: string;
  prenom: string;
  sexe?: 'M' | 'F' | string;
  dateNaissance?: string;          // yyyy-MM-dd
  dateInscriptionClub?: string;    // yyyy-MM-dd



  /* ── Parent/tuteur ──────────────────────────────────────────── */
  nomParent?: string;
  emailParent?: string;
  telephoneParent?: string;

  /* ── Équipe / avatar ───────────────────────────────────────── */
  nomEquipe?: string;
  imageBase64?: string;            // “data:image/…;base64,…” optionnel
  imageUri?: string;               // helper front (non renvoyé par l’API)

  /* ── Relations ─────────────────────────────────────────────── */
  activites?: ActiviteDTO[];       // liste d’activités suivies
  horairesCours?: HoraireDTO[];    // créneaux d’entraînement
  performances?: PerformanceDTO[]; // historique des perfs
  paiements?: PaiementDTO[];       // cotisations réglées
  participants?: AdherentDTO[];    // ex. pour les compétitions en équipe
}
