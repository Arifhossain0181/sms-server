import bcrypt from 'bcryptjs';

type GuardianInput = {
    guardianName?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianRelation?: string;
};

/**
 * Used by createStudent — reuses an existing Parent account if this
 * guardian email already belongs to one (sibling already admitted),
 * otherwise creates a new Parent+User. Returns the parentId to link, or
 * null if no guardian info was given.
 */
export async function linkOrCreateGuardian(tx: any, guardian: GuardianInput): Promise<string | null> {
    if (!guardian.guardianName || !guardian.guardianEmail) return null;

    let parentRecord = await tx.parent.findFirst({
        where: { user: { email: guardian.guardianEmail } },
    });

    if (!parentRecord) {
        const existingUser = await tx.user.findUnique({ where: { email: guardian.guardianEmail } });
        if (existingUser) {
            throw new Error(
                `This email (${guardian.guardianEmail}) is already in use by another ${existingUser.role} account`
            );
        }
        const parentUser = await tx.user.create({
            data: {
                name: guardian.guardianName,
                email: guardian.guardianEmail,
                passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
                role: 'PARENT',
            },
        });
        parentRecord = await tx.parent.create({
            data: {
                userId: parentUser.id,
                name: guardian.guardianName,
                phone: guardian.guardianPhone || '',
                relation: guardian.guardianRelation,
            },
        });
    }

    return parentRecord.id;
}

/**
 * Used by update() — edits the existing Parent if the student already has
 * one, or creates a new Parent+User if guardian info is being added for the
 * first time. Returns a parentId only when a NEW parent was created (so the
 * caller knows to `connect` it); returns undefined when an existing parent
 * was edited in place (no relation change needed) or nothing was provided.
 */
export async function updateGuardian(
    tx: any,
    existingParent: { id: string; userId: string } | null | undefined,
    guardian: GuardianInput
): Promise<string | undefined> {
    const { guardianName, guardianPhone, guardianEmail, guardianRelation } = guardian;
    const nothingProvided =
        guardianName === undefined && guardianPhone === undefined &&
        guardianEmail === undefined && guardianRelation === undefined;
    if (nothingProvided) return undefined;

    if (existingParent?.id) {
        const parentUpdateData: Record<string, any> = {};
        if (guardianName !== undefined) parentUpdateData.name = guardianName;
        if (guardianPhone !== undefined) parentUpdateData.phone = guardianPhone;
        // FIX (carried over): guardianRelation used to be silently dropped here.
        if (guardianRelation !== undefined) parentUpdateData.relation = guardianRelation;

        if (Object.keys(parentUpdateData).length > 0) {
            await tx.parent.update({ where: { id: existingParent.id }, data: parentUpdateData });
        }
        if (guardianEmail !== undefined && existingParent.userId) {
            await tx.user.update({ where: { id: existingParent.userId }, data: { email: guardianEmail } });
        }
        return undefined;
    }

    if (guardianName || guardianEmail) {
        const parentUser = await tx.user.create({
            data: {
                name: guardianName || 'Guardian',
                email: guardianEmail || `guardian-${Date.now()}@school.local`,
                passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
                role: 'PARENT',
            },
        });
        const parentRecord = await tx.parent.create({
            data: {
                userId: parentUser.id,
                name: guardianName || 'Guardian',
                phone: guardianPhone || '',
                relation: guardianRelation,
            },
        });
        return parentRecord.id;
    }

    return undefined;
}