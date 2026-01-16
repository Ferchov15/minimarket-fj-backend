import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Producto = sequelize.define(
  "Producto",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    imagenUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    imagenPublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    categoria: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "productos",
    timestamps: true,
  }
);

export default Producto;
