import Producto from "../models/Producto.js";
import { v2 as cloudinary } from "cloudinary";

// 🟢 Crear un nuevo producto con imagen Cloudinary + cálculo descuento
export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, descuento, categoria } = req.body;

    let imagenUrl = null;
    let imagenPublicId = null;

    if (req.file) {
      imagenUrl = req.file.path;
      imagenPublicId = req.file.filename;
    }

    // 🟡 Cálculo de precio final con descuento
    const precioFinal = descuento
      ? precio - (precio * descuento) / 100
      : precio;

    const nuevoProducto = await Producto.create({
      nombre,
      descripcion,
      precio,
      descuento,
      precioFinal,   // <--- NUEVO
      stock,
      categoria,
      imagenUrl,
      imagenPublicId,
    });

    res.status(201).json({
      mensaje: "✅ Producto creado correctamente",
      producto: nuevoProducto,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "❌ Error al crear el producto", error });
  }
};

// 🔵 Obtener todos los productos
export const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: "❌ Error al obtener los productos", error });
  }
};

// 🔵 Obtener un producto por ID
export const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json(producto);

  } catch (error) {
    res.status(500).json({ mensaje: "❌ Error al obtener el producto", error });
  }
};

// 🟡 Actualizar producto con cálculo descuento + imagen opcional
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    // 🟡 Calcular nuevo precioFinal si viene precio o descuento
    if (datos.precio !== undefined || datos.descuento !== undefined) {
      const nuevoPrecio = datos.precio !== undefined ? datos.precio : producto.precio;
      const nuevoDescuento =
        datos.descuento !== undefined ? datos.descuento : producto.descuento;

      datos.precioFinal = nuevoPrecio - (nuevoPrecio * nuevoDescuento) / 100;
    }

    // 🖼️ Actualizar imagen si viene una nueva
    if (req.file) {
      if (producto.imagenPublicId) {
        await cloudinary.uploader.destroy(producto.imagenPublicId);
      }

      datos.imagenUrl = req.file.path;
      datos.imagenPublicId = req.file.filename;
    }

    await producto.update(datos);

    res.json({
      mensaje: "✅ Producto actualizado correctamente",
      producto,
    });

  } catch (error) {
    res.status(500).json({ mensaje: "❌ Error al actualizar el producto", error });
  }
};

// 🔴 Eliminar producto
export const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    if (producto.imagenPublicId) {
      await cloudinary.uploader.destroy(producto.imagenPublicId);
    }

    await producto.destroy();

    res.json({ mensaje: "🗑️ Producto eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ mensaje: "❌ Error al eliminar el producto", error });
  }
};
