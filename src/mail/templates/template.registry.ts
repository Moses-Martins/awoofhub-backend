import { resetPasswordEmailTemplate } from "./reset-password.template";
import { signupEmailTemplate } from "./signup.template";


export const templates = {
    'signup-mail': signupEmailTemplate,
    'reset-password': resetPasswordEmailTemplate,
} as const;

export type TemplateName = keyof typeof templates;
export type TemplateData<T extends TemplateName> =
    Parameters<(typeof templates)[T]>[0];
