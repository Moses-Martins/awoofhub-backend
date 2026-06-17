import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TemplateData, TemplateName, templates } from "./templates/template.registry";

@Injectable()
export class TemplateService {
    constructor(private configService: ConfigService) { }

    render<T extends TemplateName>(template: T, data: Omit<TemplateData<T>, 'frontendUrl'>): string {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        return templates[template]({
            ...(data as any),
            frontendUrl,
        });
    }
}