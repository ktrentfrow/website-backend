import { Association, DataTypes, Model, ModelStatic } from "sequelize";
import {
  Column,
  CreatedDateColumn,
  Entity,
  UpdatedDateColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "sequelizejs-decorators";
import { DataType } from "sequelize-typescript";
import { IWorkHistory } from "@/api";

@Entity()
export abstract class WorkHistory
  extends Model<IWorkHistory>
  implements IWorkHistory
{
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: DataTypes.TEXT, allowNull: false })
  public companyName: string;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  public title: string;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  public overview: string;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  public description: string;

  @Column({ type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true })
  technologies: string[];

  @Column({ type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true })
  details: string[];

  @Column({ type: DataTypes.DATE, allowNull: true })
  public startDate: Date;

  @Column({ type: DataTypes.DATE, allowNull: true })
  public endDate: Date;

  @CreatedDateColumn()
  public created: Date;

  @UpdatedDateColumn()
  public updated: Date;
}

export interface WorkHistoryModel extends ModelStatic<WorkHistory> {}
