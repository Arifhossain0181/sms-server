export const GENDER_MAP = { 'Male': 'MALE', 'Female': 'FEMALE', 'Other': 'OTHER' } as const;

export const BLOOD_GROUP_MAP: Record<string, string> = {
    'A+': 'A_POS', 'A-': 'A_NEG', 'B+': 'B_POS', 'B-': 'B_NEG',
    'AB+': 'AB_POS', 'AB-': 'AB_NEG', 'O+': 'O_POS', 'O-': 'O_NEG',
};

export function mapGender(input: string): string {
    const mapped = GENDER_MAP[input as keyof typeof GENDER_MAP];
    if (!mapped) throw new Error(`Invalid gender: ${input}`);
    return mapped;
}

/** Blood group is optional — undefined stays undefined, unmapped strings pass through unchanged. */
export function mapBloodGroup(input?: string): string | undefined {
    if (!input) return undefined;
    return BLOOD_GROUP_MAP[input] ?? input;
}