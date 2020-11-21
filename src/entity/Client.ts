import { ClientEvent } from "../enum";
import { EntityBase, EntityCreationError, IEntity, IEntityBaseOptions, TObject } from "@lindorm-io/core";

export interface IClient extends IEntity {
  approved: boolean;
  description: string;
  extra: TObject<any>;
  name: string;
  secret: string;
}

export interface IClientOptions extends IEntityBaseOptions {
  approved?: boolean;
  description?: string;
  extra?: TObject<any>;
  name?: string;
  secret?: string;
}

export class Client extends EntityBase implements IClient {
  private _approved: boolean;
  private _description: string;
  private _extra: TObject<any>;
  private _name: string;
  private _secret: string;

  constructor(options?: IClientOptions) {
    super(options);
    this._approved = options?.approved || false;
    this._description = options?.description || null;
    this._extra = options?.extra || {};
    this._name = options?.name || null;
    this._secret = options?.secret || null;
  }

  public get approved(): boolean {
    return this._approved;
  }
  public set approved(approved: boolean) {
    this._approved = approved;
    this.addEvent(ClientEvent.APPROVED_CHANGED, { approved: this._approved });
  }

  public get description(): string {
    return this._description;
  }
  public set description(description: string) {
    this._description = description;
    this.addEvent(ClientEvent.DESCRIPTION_CHANGED, { description: this._description });
  }

  public get extra(): TObject<any> {
    return this._extra;
  }
  public set extra(object: TObject<any>) {
    this._extra = object;
    this.addEvent(ClientEvent.EXTRA_CHANGED, { extra: this._extra });
  }

  public get name(): string {
    return this._name;
  }
  public set name(name: string) {
    this._name = name;
    this.addEvent(ClientEvent.NAME_CHANGED, { name: this._name });
  }

  public get secret(): string {
    return this._secret;
  }
  public set secret(secret: string) {
    this._secret = secret;
    this.addEvent(ClientEvent.SECRET_CHANGED, { secret: this._secret });
  }

  public create(): void {
    for (const evt of this._events) {
      if (evt.name !== ClientEvent.CREATED) continue;
      throw new EntityCreationError("Client");
    }
    this.addEvent(ClientEvent.CREATED, {
      approved: this._approved,
      description: this._description,
      extra: this._extra,
      name: this._name,
      secret: this._secret,
      created: this._created,
      updated: this._updated,
    });
  }
}
