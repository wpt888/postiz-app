import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';

@Injectable()
export class OrganizationOAuthAppRepository {
  constructor(
    private _oauthApp: PrismaRepository<'organizationOAuthApp'>
  ) {}

  upsert(
    organizationId: string,
    providerIdentifier: string,
    data: {
      clientId: string;
      clientSecret: string;
      additionalConfig?: string | null;
    }
  ) {
    return this._oauthApp.model.organizationOAuthApp.upsert({
      where: {
        organizationId_providerIdentifier: {
          organizationId,
          providerIdentifier,
        },
      },
      create: {
        organizationId,
        providerIdentifier,
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        additionalConfig: data.additionalConfig ?? null,
      },
      update: {
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        additionalConfig: data.additionalConfig ?? null,
        deletedAt: null,
      },
    });
  }

  findOne(organizationId: string, providerIdentifier: string) {
    return this._oauthApp.model.organizationOAuthApp.findFirst({
      where: {
        organizationId,
        providerIdentifier,
        deletedAt: null,
      },
    });
  }

  list(organizationId: string) {
    return this._oauthApp.model.organizationOAuthApp.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  softDelete(organizationId: string, providerIdentifier: string) {
    return this._oauthApp.model.organizationOAuthApp.updateMany({
      where: {
        organizationId,
        providerIdentifier,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
