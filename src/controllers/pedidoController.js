import { Pedido, Producto, PedidoProducto } from "../models/Relaciones.js";

export const crearPedido = async (req, res) => {
  try {
    const { nombreCliente, productos } = req.body; 


    const nuevoPedido = await Pedido.create({ nombreCliente });

    for (const item of productos) {
      await PedidoProducto.create({
        pedidoId: nuevoPedido.id,
        productoId: item.id,
        cantidad: item.cantidad,
      });
    }

    res.status(201).json({ mensaje: "Pedido creado correctamente", pedido: nuevoPedido });
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