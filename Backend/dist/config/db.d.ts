import 'dotenv/config';
import { Sequelize } from 'sequelize';
declare let sequelize: Sequelize;
export declare function connectDB(): Promise<Sequelize | null>;
export { sequelize, Sequelize };
//# sourceMappingURL=db.d.ts.map