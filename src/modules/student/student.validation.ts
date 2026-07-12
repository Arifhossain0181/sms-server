export function assertValidRollNumber(raw: unknown): number {
    const rollNumber = Number(raw);
    if (!Number.isInteger(rollNumber)) {
        throw new Error("Roll number must be a valid number");
    }
    return rollNumber;
}

export function assertValidDob(dateOfBirth: string): Date {
    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
        throw new Error('Invalid dateOfBirth format');
    }
    return dob;
}