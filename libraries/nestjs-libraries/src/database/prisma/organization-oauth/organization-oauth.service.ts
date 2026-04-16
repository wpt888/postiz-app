import { Injectable } from '@nestjs/common';
import { OrganizationOAuthAppRepository } from '@gitroom/nestjs-libraries/database/prisma/organization-oauth/organization-oauth.repository';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import { ClientInformation } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';

export interface OAuthAppListEntry {
  providerIdentifier: string;
  configured: boolean;
  clientIdMasked?: string;
  updatedAt?: Date;
}

@Injectable()
export class OrganizationOAuthAppService {
  constructor(
    private _oauthAppRepository: OrganizationOAuthAppRepository
  ) {}

  async upsert(
    organizationId: string,
    providerIdentifier: string,
    data: {
      clientId: string;
      clientSecret: string;
      additionalConfig?: string | null;
    }
  ) {
    return this._oauthAppRepository.upsert(organizationId, providerIdentifier, {
      clientId: AuthService.fixedEncryption(data.clientId),
      clientSecret: AuthService.fixedEncryption(data.clientSecret),
      additionalConfig: data.additionalConfig
        ? AuthService.fixedEncryption(data.additionalConfig)
        : null,
    });
  }

  async get(
    organizationId: string,
    providerIdentifier: string
  ): Promise<ClientInformation | null> {
    const row = await this._oauthAppRepository.findOne(
      organizationId,
      providerIdentifier
    );
    if (!row) return null;
    try {
      return {
        client_id: AuthService.fixedDecryption(row.clientId),
        client_secret: AuthService.fixedDecryption(row.clientSecret),
        instanceUrl: '',
      };
    } catch {
      return null;
    }
  }

  async listSummary(organizationId: string): Promise<OAuthAppListEntry[]> {
    const rows = await this._oauthAppRepository.list(organizationId);
    return rows.map((row) => {
      let clientIdMasked: string | undefined;
      try {
        const decrypted = AuthService.fixedDecryption(row.clientId);
        clientIdMasked =
          decrypted.length > 4
            ? `${'*'.repeat(Math.max(0, decrypted.length - 4))}${decrypted.slice(-4)}`
            : '****';
      } catch {
        clientIdMasked = '****';
      }
      return {
        providerIdentifier: row.providerIdentifier,
        configured: true,
        clientIdMasked,
        updatedAt: row.updatedAt,
      };
    });
  }

  async delete(organizationId: string, providerIdentifier: string) {
    return this._oauthAppRepository.softDelete(
      organizationId,
      providerIdentifier
    );
  }
}
