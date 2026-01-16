import { Pedido, Producto, PedidoProducto } from "../models/Relaciones.js";

/* =============================
            CREACIÓN PEDIDO
============================= */
export const crearPedido = async (req, res) => {
  try {
    const { nombreCliente, productos, metodoPago } = req.body;

    if (!nombreCliente || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        mensaje: "Datos incompletos para crear el pedido, porfavor ingrese su nombre",
      });
    }

    const metodosPermitidos = ["EFECTIVO", "DEUNA"];
    if (!metodosPermitidos.includes(metodoPago)) {
      return res.status(400).json({
        mensaje: "Método de pago no válido",
      });
    }

    const nuevoPedido = await Pedido.create({
      nombreCliente,
      metodoPago,
    });

    for (const item of productos) {
      const producto = await Producto.findByPk(item.id);

      if (!producto) {
        return res.status(404).json({
          mensaje: `Producto con ID ${item.id} no encontrado`,
        });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
        });
      }

      await PedidoProducto.create({
        pedidoId: nuevoPedido.id,
        productoId: item.id,
        cantidad: item.cantidad,
      });

      await producto.update({
        stock: producto.stock - item.cantidad,
      });
    }

    res.status(201).json({
      mensaje: "Su pedido se creo correctamente",
      pedido: nuevoPedido,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({
      mensaje: "Error al crear el pedido",
    });
  }
};

/* =============================
            OBTENER PEDIDOS
============================= */
export const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      order: [["fecha", "DESC"]],
      include: {
        model: Producto,
        as: "productos",
        through: { attributes: ["cantidad"] },
      },
    });

    const pedidosConTotal = pedidos.map((pedido) => {
      let total = 0;

      pedido.productos.forEach((prod) => {
        total +=
          parseFloat(prod.precio) * prod.PedidoProducto.cantidad;
      });

      return {
        id: pedido.id,
        nombreCliente: pedido.nombreCliente,
        metodoPago: pedido.metodoPago,
        estado: pedido.estado,
        fecha: pedido.fecha,
        total: total.toFixed(2),
        productos: pedido.productos,
      };
    });

    res.json(pedidosConTotal);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({
      mensaje: "Error al obtener pedidos",
    });
  }
};

/* ======================================
            OBTENER PEDIDO POR ID
========================================= */
export const obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id, {
      include: {
        model: Producto,
        as: "productos",
        through: { attributes: ["cantidad"] },
      },
    });

    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado",
      });
    }

    let total = 0;
    pedido.productos.forEach((prod) => {
      total +=
        parseFloat(prod.precio) * prod.PedidoProducto.cantidad;
    });

    res.json({
      id: pedido.id,
      nombreCliente: pedido.nombreCliente,
      metodoPago: pedido.metodoPago,
      estado: pedido.estado,
      fecha: pedido.fecha,
      total: total.toFixed(2),
      productos: pedido.productos,
    });
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    res.status(500).json({
      mensaje: "Error al obtener pedido",
    });
  }
};

/* ======================================
      ACTUALIZAR ESTADO DEL PEDIDO
========================================= */
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = [
      "En proceso",
      "Completado",
      "Cancelado",
    ];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "Estado no válido",
      });
    }

    const pedido = await Pedido.findByPk(id, {
      include: {
        model: Producto,
        as: "productos",
        through: { attributes: ["cantidad"] },
      },
    });

    if (!pedido) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado",
      });
    }

    //  Rollback de stock SOLO si se cancela
    if (
      estado === "Cancelado" &&
      pedido.estado !== "Cancelado"
    ) {
      for (const prod of pedido.productos) {
        const productoReal = await Producto.findByPk(prod.id);
        await productoReal.update({
          stock:
            productoReal.stock +
            prod.PedidoProducto.cantidad,
        });
      }
    }

    pedido.estado = estado;
    await pedido.save();

    res.json({
      mensaje: "Estado actualizado correctamente",
      pedido,
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({
      mensaje: "Error al actualizar estado",
    });
  }
};
