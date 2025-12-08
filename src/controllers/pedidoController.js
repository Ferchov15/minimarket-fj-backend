import { Pedido, Producto, PedidoProducto } from "../models/Relaciones.js";

export const crearPedido = async (req, res) => {
  try {
    const { nombreCliente, productos } = req.body;

    // 1️⃣ Crear pedido
    const nuevoPedido = await Pedido.create({ nombreCliente });

    // 2️⃣ Agregar productos + actualizar stock
    for (const item of productos) {
      // Buscar el producto real
      const producto = await Producto.findByPk(item.id);

      if (!producto) {
        return res.status(404).json({ mensaje: `Producto con ID ${item.id} no encontrado` });
      }

      // Verificar stock disponible
      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para el producto ${producto.nombre}. Disponible: ${producto.stock}, solicitado: ${item.cantidad}`
        });
      }

      // Registrar la relación PedidoProducto
      await PedidoProducto.create({
        pedidoId: nuevoPedido.id,
        productoId: item.id,
        cantidad: item.cantidad,
      });

      // Actualizar stock
      await producto.update({
        stock: producto.stock - item.cantidad,
      });
    }

    res.status(201).json({
      mensaje: "Pedido creado correctamente y stock actualizado",
      pedido: nuevoPedido,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al crear el pedido", error });
  }
};


export const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: {
        model: Producto,
        as: "productos",
        through: { attributes: ["cantidad"] },
      },
    });

    // Calcular total por pedido
    const pedidosConTotal = pedidos.map((pedido) => {
      let total = 0;

      pedido.productos.forEach((prod) => {
        total += parseFloat(prod.precio) * prod.PedidoProducto.cantidad;
      });

      return {
        id: pedido.id,
        nombreCliente: pedido.nombreCliente,
        estado: pedido.estado,
        fecha: pedido.fecha,
        total: total.toFixed(2),
        productos: pedido.productos,
      };
    });

    res.json(pedidosConTotal);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener pedidos", error });
  }
};

export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ["En proceso", "Completado", "Cancelado"];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ mensaje: "Estado no válido" });
    }

    const pedido = await Pedido.findByPk(id, {
      include: {
        model: Producto,
        as: "productos",
        through: { attributes: ["cantidad"] },
      },
    });

    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    // ⛔ Si ya estaba cancelado o completado NO hago rollback dos veces
    if (pedido.estado === "Cancelado" && estado === "Cancelado") {
      return res.json({ mensaje: "El pedido ya está cancelado", pedido });
    }

    // 🔥 SI EL NUEVO ESTADO ES CANCELADO → ROLLBACK AL STOCK
    if (estado === "Cancelado") {
      for (const producto of pedido.productos) {
        const cantidad = producto.PedidoProducto.cantidad;

        const productoReal = await Producto.findByPk(producto.id);

        await productoReal.update({
          stock: productoReal.stock + cantidad, // REGRESA EL STOCK
        });
      }
    }

    // 🟢 ACTUALIZAR SOLO EL ESTADO
    pedido.estado = estado;
    await pedido.save();

    res.json({
      mensaje: "Estado actualizado correctamente",
      pedido,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar el pedido", error });
  }
};


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
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    let total = 0;
    pedido.productos.forEach((prod) => {
      total += parseFloat(prod.precio) * prod.PedidoProducto.cantidad;
    });

    res.json({
      id: pedido.id,
      nombreCliente: pedido.nombreCliente,
      estado: pedido.estado,
      fecha: pedido.fecha,
      total: total.toFixed(2),
      productos: pedido.productos,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener pedido", error });
  }
};
