/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const areaNames = [
    "Estrutural",
    "Acabamento",
    "Eletrica",
    "Hidraulica",
    "Planejamento"
  ];

  for (const nome of areaNames) {
    const existingArea = await knex("Areas").where({ nome }).first();
    if (!existingArea) {
      await knex("Areas").insert({ nome });
    }
  }

  const areas = await knex("Areas").select("id", "nome").whereIn("nome", areaNames);
  const areaIdByName = areas.reduce((acc, area) => {
    acc[area.nome] = area.id;
    return acc;
  }, {});

  const cargos = [
    { nome: "Engenheiro Civil", salario: 8500.00, areaNome: "Estrutural" },
    { nome: "Mestre de Obras", salario: 6200.00, areaNome: "Planejamento" },
    { nome: "Eletricista", salario: 3800.00, areaNome: "Eletrica" },
    { nome: "Encanador", salario: 3600.00, areaNome: "Hidraulica" },
    { nome: "Pintor", salario: 2900.00, areaNome: "Acabamento" }
  ];

  for (const cargo of cargos) {
    const areaId = areaIdByName[cargo.areaNome];
    if (!areaId) {
      continue;
    }

    const exists = await knex("Cargos")
      .where({ nome: cargo.nome, areaId })
      .first();

    if (!exists) {
      await knex("Cargos").insert({
        nome: cargo.nome,
        salario: cargo.salario,
        areaId
      });
    }
  }

  const materiais = [
    {
      nome: "Cimento CP-II 50kg",
      descricao: "Saco de cimento para concretagem e argamassa.",
      unidadeMedida: "saco",
      areaNome: "Estrutural"
    },
    {
      nome: "Areia Media",
      descricao: "Areia lavada para preparo de concreto e reboco.",
      unidadeMedida: "m3",
      areaNome: "Estrutural"
    },
    {
      nome: "Tinta Acrilica Branca",
      descricao: "Tinta acrilica premium para paredes internas.",
      unidadeMedida: "lata",
      areaNome: "Acabamento"
    },
    {
      nome: "Cabo Flexivel 2.5mm",
      descricao: "Cabo de cobre isolado para instalacoes eletricas.",
      unidadeMedida: "metro",
      areaNome: "Eletrica"
    },
    {
      nome: "Tubo PVC 25mm",
      descricao: "Tubo para distribuicao hidraulica de agua fria.",
      unidadeMedida: "barra",
      areaNome: "Hidraulica"
    }
  ];

  for (const material of materiais) {
    const areaId = areaIdByName[material.areaNome];
    if (!areaId) {
      continue;
    }

    const exists = await knex("Materiais")
      .where({ nome: material.nome, areaId })
      .first();

    if (!exists) {
      await knex("Materiais").insert({
        nome: material.nome,
        descricao: material.descricao,
        unidadeMedida: material.unidadeMedida,
        areaId
      });
    }
  }

  const hasMaquinarioAreaId = await knex.schema.hasColumn("Maquinarios", "areaId");

  const maquinarios = [
    {
      nome: "Betoneira 400L",
      descricao: "Misturador eletrico de concreto com tambor de 400 litros.",
      valor: 180.00,
      areaNome: "Estrutural"
    },
    {
      nome: "Andaime Fachadeiro",
      descricao: "Modulo de andaime para trabalho em altura.",
      valor: 95.00,
      areaNome: "Acabamento"
    },
    {
      nome: "Furadeira de Impacto",
      descricao: "Furadeira para alvenaria e instalacoes eletricas.",
      valor: 70.00,
      areaNome: "Eletrica"
    },
    {
      nome: "Maquina de Solda",
      descricao: "Equipamento para soldagem de estruturas metalicas.",
      valor: 210.00,
      areaNome: "Planejamento"
    },
    {
      nome: "Compactador de Solo",
      descricao: "Placa vibratoria para compactacao de base e sub-base.",
      valor: 260.00,
      areaNome: "Estrutural"
    }
  ];

  for (const maquina of maquinarios) {
    const query = knex("Maquinarios").where({ nome: maquina.nome });
    if (hasMaquinarioAreaId) {
      const areaId = areaIdByName[maquina.areaNome];
      if (!areaId) {
        continue;
      }
      query.andWhere({ areaId });
    }

    const exists = await query.first();
    if (exists) {
      continue;
    }

    const payload = {
      nome: maquina.nome,
      descricao: maquina.descricao,
      valor: maquina.valor
    };

    if (hasMaquinarioAreaId) {
      payload.areaId = areaIdByName[maquina.areaNome];
    }

    await knex("Maquinarios").insert(payload);
  }
};
