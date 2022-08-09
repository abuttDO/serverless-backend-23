export enum UserRole {
    REGISTERED = "REGISTERED",
    SELECTED = "SELECTED",
    REJECTED = "REJECTED",
    ADMIN = "ADMIN"
  }

export const ADMINMAILLIST = ["webops@shaastra.org"]

export interface SendVerificationMailOptions {
  name: string;
  email: string;
  id: string;
  verifyToken: string
}

export interface SendConfirmationMailOptions {
  name: string;
  email: string;
}

export interface SendSelectionMailOptions {
  name: string;
  email: string;
  isSelected: boolean;
}

export enum TaskStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  CLOSED = "CLOSED"
}