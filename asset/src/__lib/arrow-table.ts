import * as a from 'apache-arrow';
import * as dt from '@terascope/data-types';
import { DataEntity } from '@terascope/job-components';

export class ArrowTable {
    readonly typeConfig: dt.TypeConfigFields;
    readonly table: a.Table;
    readonly schema: a.Schema;

    constructor(typeConfig: dt.TypeConfigFields) {
        this.typeConfig = typeConfig;
        this.schema = new a.Schema(Object.entries(typeConfig).map(
            ([name, { type }]) => new a.Field(
                name, this.getArrowDataType(type) as a.DataType
            )
        ));
        this.table = new a.Table(this.schema);
    }

    concat(_records: DataEntity[]): void {

    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    getArrowDataType(type: dt.AvailableType, array?: boolean) {
        switch (type) {
            case 'Boolean':
                if (array) return new a.BoolVector(null as any);
                return new a.Bool();
            case 'Float':
                if (array) return new a.Float32Vector(null as any);
                return new a.Float32();
            case 'Double':
                if (array) return new a.Float64Vector(null as any);
                return new a.Float64();
            case 'Byte':
                if (array) return new a.BinaryVector(null as any);
                return new a.Binary();
            case 'Short':
                if (array) return new a.Int8Vector(null as any);
                return new a.Int8();
            // this may not compatible
            case 'Number':
            case 'Integer':
                if (array) return new a.Int32Vector(null as any);
                return new a.Int32();
            case 'Long':
                if (array) return new a.Int64Vector(null as any);
                return new a.Int64();
            default:
                if (array) return new a.Utf8Vector(null as any);
                return new a.Utf8();
        }
    }
}
