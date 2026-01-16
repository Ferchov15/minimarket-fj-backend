import Producto from "../models/Producto.js";
import { v2 as cloudinary } from "cloudinary";

/* ======================================================
                CREAR PRODUCTO
====================================================== */
export const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
    } = req.body;

    let imagenUrl = null;
    let imagenPublicId = null;

    if (req.file) {
      imagenUrl = req.file.path;
      imagenPublicId = req.file.filename;
    }

    const nuevoProducto = await Producto.create({
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      imagenUrl,
      imagenPublicId,
    });

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto: nuevoProducto,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al crear el producto",
    });
  }
};

/* ======================================================
          OBTENER TODOS LOS PRODUCTOS
====================================================== */
export const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { estado: true },
    });

    res.json(productos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener productos",
    });
  }
};

/* ======================================================
             OBTENER PRODUCTO POR ID
====================================================== */
export const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);

    if (!producto || !producto.estado) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener el producto",
    });
  }
};

/* ======================================================
               ACTUALIZAR PRODUCTO
====================================================== */
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    if (req.file) {
      if (producto.imagenPublicId) {
        await cloudinary.uploader.destroy(producto.imagenPublicId);
      }

      datos.imagenUrl = req.file.path;
      datos.imagenPublicId = req.file.filename;
    }

    await producto.update(datos);

    res.json({
      mensaje: "El producto se actualizo correctamente",
      producto,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al actualizar producto, revisar el contenido",
    });
  }
};

/* ======================================================
                  ELIMINAR PRODUCTO
====================================================== */
export const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    producto.estado = false;
    await producto.save();

    res.json({
      mensaje: "Producto Eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar producto",
    });
  }
};
