-- migrate:up

ALTER TYPE "NotificationType" ADD VALUE 'LEAVE';
ALTER TYPE "NotificationType" ADD VALUE 'PAYROLL';
ALTER TYPE "NotificationType" ADD VALUE 'RECRUITMENT';

-- migrate:down
