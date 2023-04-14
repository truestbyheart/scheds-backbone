import { Model, Repository } from 'sequelize-typescript';
import { FindOptions, Includeable, Order, WhereOptions } from 'sequelize/types';
import { Fn } from 'sequelize/types/lib/utils';
import { Base } from '../../Database/base';
import { IPageMeta } from '../Recursion/recursion.service';

export class PagedResult<T extends Model<T>> {
  constructor(
    public readonly data: T[],
    public readonly pageMeta: {
      page: number;
      totalPages: number;
      limit: number;
      count: number;
      pageItemsNumber: number;
    },
  ) {}
}

export class RootService<T extends Model<T>> {
  protected readonly defaultPaginationLimit = 10;

  constructor(protected readonly model: Repository<T>) {}

  protected createWhereOptions = (option: IPropOption<T>) => ({ [option.prop]: option.value });

  findOneByProp = async (option: IPropOption<T>, include?: Includeable[], attributes?: string[]) => {
    const result = await this.model.findOne({ include, where: this.createWhereOptions(option), attributes });
    return result ? (result.get({ plain: true }) as T) : null;
  };

  findManyByProp = async (option: IPropOption<T>, include?: Includeable[], attributes?: string[]) => {
    const result = await this.model.findAll({ include, where: this.createWhereOptions(option), attributes });
    return result.map((item) => item.get({ plain: true })) as T[];
  };

  findAll = async (options: FindOptions): Promise<T[]> => {
    const result = await this.model.findAll(options);
    return result.map((e) => e.get({ plain: true })) as T[];
  };

  async add<TInterface extends Record<string, any>>(model: TInterface) {
    const result = await this.model.create(model);
    return result ? (result.get({ plain: true }) as T) : null;
  }

  protected getValidPageNumber(page: number, totalPages: number) {
    let thePage = page || 1;
    thePage = thePage > totalPages ? totalPages : thePage <= 0 ? 1 : thePage;
    return thePage;
  }

  protected async getPaginationOptions(options: IPaginationOptions) {
    const {
      where = undefined,
      attributes = undefined,
      include = undefined,
      order = undefined,
      group = undefined,
      subQuery = false,
    } = options.defaultOptions || {};
    const count = await this.model.count({ where });

    const { limit = this.defaultPaginationLimit } = options;
    const totalPages = Math.ceil(count / limit) || 1;
    const currentPage = options.page ? options.page : 1;

    const offset = (currentPage - 1) * limit;
    return {
      dbOptions: {
        where,
        include,
        attributes,
        order,
        offset,
        limit,
        group,
        subQuery,
      },
      meta: {
        totalPages,
        limit,
        count,
        page: currentPage,
      },
    };
  }

  async getPaginated(options: IPaginationOptions) {
    const pageOptions = await this.getPaginationOptions(options);
    // @ts-ignore
    const result = await this.model.findAll(pageOptions.dbOptions);
    return new PagedResult(
      result.map((entry: T) => entry.get() as T),
      { ...pageOptions.meta, pageItemsNumber: result.length },
    );
  }
}

export class BaseService<T extends Base<T>, TId extends string | number>
  extends RootService<T>
  implements IModelService<T, TId>
{
  // constructor(protected readonly model: Repository<T>) { }

  constructor(model: Repository<T>) {
    super(model);
  }

  findById = async (id: TId, include?: Includeable[], attributes?: string[]): Promise<T> => {
    const result = await this.model.findByPk(id, { include, attributes });
    // @ts-ignore
    return result ? (result.get({ plain: true }) as T) : null;
  };

  protected shouldReturnUpdated(returning: IReturningOptions) {
    return returning && returning.returning;
  }

  async update(id: TId, data: any, returning?: IReturningOptions) {
    const [, [result]] = await this.model.update(
      { ...data },
      {
        where: { id },
        returning: true,
      },
    );

    if (!this.shouldReturnUpdated(returning as IReturningOptions)) return result.get() as T;
    return await this.findById(id, returning?.include);
  }

  async generatePageMeta(page: number, limit: number, where: any): Promise<IPageMeta> {
    // count the data
    const count: number = await this.model.count({ where });

    // calculate total page
    const totalPages = Math.ceil(count / limit) || 1;
    const currentPage = this.getValidPageNumber(page, totalPages);
    return {
      totalPages,
      limit,
      count,
      page: currentPage,
    };
  }
}

export interface IPropOption<T> {
  prop: keyof T;
  value: any;
}

export interface IPaginationOptions {
  defaultOptions?: IFindOptions;
  limit?: number;
  page?: number;
}

export interface IFindOptions {
  where?: WhereOptions;
  include?: Includeable[];
  order?: Order;
  attributes?: (string | (string | Fn)[])[] | { exclude: string[] };
  group?: string[];
  subQuery: boolean;
  limit?: number;
}

export interface IModelService<T, TId> {
  findById(id: TId, include?: Includeable[]): Promise<T>;

  findAll(filter: object): Promise<T[]>;
}

export interface IReturningOptions {
  returning: boolean;
  include?: Includeable[];
}
