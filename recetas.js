// Recetas fáciles para completar los macros del día (valores aproximados por porción).
// k = kcal, p = proteínas, c = carbohidratos, g = grasas (g). t = momentos del día en los que encaja.
window.RECETAS = [
  {
    n: 'Omelette de claras y queso', min: 10, t: ['Desayuno', 'Merienda', 'Cena'], k: 230, p: 26, c: 2, g: 13,
    ing: ['3 claras y 1 huevo entero', '30 g de queso cremoso', 'Sal, pimienta, orégano'],
    pasos: ['Batí las claras con el huevo.', 'Cociná en sartén antiadherente a fuego medio.', 'Agregá el queso, doblá y tapá un minuto.']
  },
  {
    n: 'Yogur griego con avena y banana', min: 3, t: ['Desayuno', 'Merienda', 'Colación'], k: 330, p: 23, c: 47, g: 5,
    ing: ['1 pote de yogur griego natural (170 g)', '3 cucharadas de avena (30 g)', 'Media banana en rodajas', 'Canela'],
    pasos: ['Poné el yogur en un bowl.', 'Sumá la avena y la banana.', 'Espolvoreá canela.']
  },
  {
    n: 'Licuado de proteína, banana y avena', min: 3, t: ['Desayuno', 'Merienda', 'Colación'], k: 460, p: 37, c: 66, g: 5,
    ing: ['1 medida de proteína en polvo', '250 ml de leche descremada', '1 banana', '3 cucharadas de avena'],
    pasos: ['Poné todo en la licuadora.', 'Licuá un minuto con hielo si querés.']
  },
  {
    n: 'Tostadas con huevo revuelto y palta', min: 10, t: ['Desayuno', 'Merienda'], k: 420, p: 22, c: 32, g: 22,
    ing: ['2 rebanadas de pan integral', '2 huevos', 'Un cuarto de palta', 'Sal y pimienta'],
    pasos: ['Tostá el pan.', 'Revolvé los huevos en sartén a fuego bajo.', 'Untá la palta y poné el huevo arriba.']
  },
  {
    n: 'Ricota con frutillas y miel', min: 3, t: ['Desayuno', 'Merienda', 'Colación'], k: 260, p: 20, c: 28, g: 7,
    ing: ['150 g de ricota descremada', '1 taza de frutillas', '1 cucharadita de miel'],
    pasos: ['Poné la ricota en un bowl.', 'Sumá las frutillas cortadas y la miel.']
  },
  {
    n: 'Panqueques de avena, banana y claras', min: 10, t: ['Desayuno', 'Merienda'], k: 330, p: 18, c: 55, g: 4,
    ing: ['40 g de avena', '1 banana pisada', '3 claras', 'Canela'],
    pasos: ['Mezclá todo hasta tener una pasta.', 'Cociná de a cucharadas en sartén antiadherente, vuelta y vuelta.']
  },
  {
    n: 'Pudding de chía con proteína', min: 5, t: ['Desayuno', 'Merienda', 'Colación'], k: 300, p: 25, c: 22, g: 12,
    ing: ['2 cucharadas de chía (25 g)', 'Media medida de proteína en polvo', '200 ml de leche descremada'],
    pasos: ['Mezclá todo en un frasco.', 'Dejalo en la heladera al menos 2 horas (o de un día para el otro).']
  },
  {
    n: 'Revuelto de huevo, espinaca y ricota', min: 10, t: ['Desayuno', 'Cena'], k: 310, p: 25, c: 5, g: 21,
    ing: ['3 huevos', '1 taza de espinaca', '50 g de ricota descremada'],
    pasos: ['Saltá la espinaca un minuto.', 'Agregá los huevos batidos y la ricota.', 'Revolvé hasta que cuaje.']
  },
  {
    n: 'Wrap de atún', min: 5, t: ['Almuerzo', 'Cena', 'Merienda'], k: 330, p: 33, c: 28, g: 8,
    ing: ['1 tortilla de trigo', '1 lata de atún al natural', 'Lechuga y tomate', '1 cucharada de queso untable light'],
    pasos: ['Untá la tortilla con el queso.', 'Sumá el atún escurrido y las verduras.', 'Enrollá y cortá al medio.']
  },
  {
    n: 'Pollo al horno con batata', min: 40, t: ['Almuerzo', 'Cena'], k: 520, p: 56, c: 41, g: 12,
    ing: ['180 g de pechuga de pollo', '200 g de batata', '1 cucharadita de aceite', 'Pimentón, ajo, sal'],
    pasos: ['Cortá la batata en cubos y el pollo en tiras.', 'Condimentá y rociá con el aceite.', 'Horno fuerte unos 30 a 35 minutos, dando vuelta a la mitad.']
  },
  {
    n: 'Milanesas de pollo al horno con ensalada', min: 30, t: ['Almuerzo', 'Cena'], k: 470, p: 50, c: 30, g: 15,
    ing: ['2 milanesas de pollo', 'Ensalada de lechuga, tomate y zanahoria', '1 cucharadita de aceite para la ensalada'],
    pasos: ['Horno fuerte 10 a 12 minutos de cada lado.', 'Serví con la ensalada.']
  },
  {
    n: 'Bowl de arroz, carne magra y verduras', min: 20, t: ['Almuerzo', 'Cena'], k: 560, p: 40, c: 50, g: 20,
    ing: ['150 g de arroz cocido', '150 g de carne picada magra', 'Morrón, cebolla y zapallito', 'Salsa de soja'],
    pasos: ['Dorá la carne con la cebolla.', 'Sumá las verduras en cubos.', 'Serví sobre el arroz con un chorrito de soja.']
  },
  {
    n: 'Fideos con atún y tomate', min: 15, t: ['Almuerzo', 'Cena'], k: 470, p: 40, c: 65, g: 4,
    ing: ['80 g de fideos secos', '1 lata de atún al natural', 'Media taza de salsa de tomate', 'Albahaca u orégano'],
    pasos: ['Herví los fideos.', 'Calentá la salsa con el atún.', 'Mezclá todo.']
  },
  {
    n: 'Ensalada de lentejas y huevo', min: 10, t: ['Almuerzo', 'Cena'], k: 420, p: 30, c: 42, g: 14,
    ing: ['1 taza de lentejas cocidas (de lata sirven)', '2 huevos duros', 'Tomate, cebolla morada, perejil', '1 cucharadita de aceite y limón'],
    pasos: ['Enjuagá las lentejas.', 'Picá las verduras y los huevos.', 'Mezclá y condimentá.']
  },
  {
    n: 'Merluza al horno con puré de calabaza', min: 25, t: ['Almuerzo', 'Cena'], k: 290, p: 38, c: 25, g: 4,
    ing: ['200 g de filet de merluza', '250 g de calabaza', 'Limón, ajo y perejil'],
    pasos: ['Herví la calabaza y hacé puré.', 'Horneá la merluza con limón y ajo 15 minutos.', 'Serví con el puré.']
  },
  {
    n: 'Hamburguesas caseras de pollo con ensalada', min: 20, t: ['Almuerzo', 'Cena'], k: 380, p: 45, c: 10, g: 17,
    ing: ['250 g de pollo picado', '1 huevo', 'Cebolla de verdeo, sal, pimienta', 'Ensalada a gusto'],
    pasos: ['Mezclá el pollo con el huevo y la cebolla.', 'Formá 2 medallones.', 'Cociná a la plancha 5 minutos de cada lado.']
  },
  {
    n: 'Sándwich de pollo y palta', min: 10, t: ['Almuerzo', 'Merienda'], k: 450, p: 38, c: 38, g: 15,
    ing: ['2 rebanadas de pan integral', '120 g de pollo cocido desmenuzado', 'Un cuarto de palta', 'Tomate y lechuga'],
    pasos: ['Pisá la palta sobre el pan.', 'Armá con el pollo y las verduras.']
  },
  {
    n: 'Bife de cuadril con arroz y brócoli', min: 25, t: ['Almuerzo', 'Cena'], k: 560, p: 52, c: 48, g: 16,
    ing: ['180 g de cuadril', '150 g de arroz cocido', '1 taza de brócoli'],
    pasos: ['Cociná el bife a la plancha a tu punto.', 'Herví o cociná al vapor el brócoli.', 'Serví con el arroz.']
  },
  {
    n: 'Garbanzos salteados con huevo', min: 10, t: ['Almuerzo', 'Cena'], k: 400, p: 22, c: 40, g: 16,
    ing: ['1 taza de garbanzos cocidos', '2 huevos', 'Cebolla, morrón y pimentón', '1 cucharadita de aceite'],
    pasos: ['Saltá la cebolla y el morrón.', 'Sumá los garbanzos y el pimentón.', 'Agregá los huevos y revolvé hasta que cuajen.']
  },
  {
    n: 'Tortilla de papa al horno con claras', min: 35, t: ['Almuerzo', 'Cena'], k: 350, p: 24, c: 35, g: 11,
    ing: ['250 g de papa', '1 huevo y 4 claras', 'Cebolla', '1 cucharadita de aceite'],
    pasos: ['Cortá la papa en rodajas finas y hervila 8 minutos.', 'Mezclá con la cebolla y los huevos.', 'Horno medio 20 minutos en molde aceitado.']
  },
  {
    n: 'Tostadas de arroz con queso untable y pavita', min: 3, t: ['Colación', 'Merienda', 'Desayuno'], k: 180, p: 15, c: 17, g: 5,
    ing: ['3 tostadas de arroz', '1 cucharada de queso untable light', '3 fetas de pechuga de pavita'],
    pasos: ['Untá las tostadas con el queso.', 'Poné la pavita arriba.']
  },
  {
    n: 'Huevos duros con una fruta', min: 12, t: ['Colación', 'Merienda'], k: 230, p: 13, c: 20, g: 10,
    ing: ['2 huevos', '1 manzana o 1 naranja'],
    pasos: ['Herví los huevos 10 minutos (podés dejar varios hechos en la heladera).', 'Acompañá con la fruta.']
  },
  {
    n: 'Atún con galletitas de arroz', min: 3, t: ['Colación', 'Merienda'], k: 200, p: 28, c: 15, g: 2,
    ing: ['1 lata de atún al natural', '4 galletitas de arroz', 'Limón y pimienta'],
    pasos: ['Escurrí el atún y condimentalo.', 'Servilo sobre las galletitas.']
  },
  {
    n: 'Yogur con proteína y frutos secos', min: 2, t: ['Colación', 'Merienda', 'Desayuno'], k: 290, p: 30, c: 18, g: 11,
    ing: ['1 pote de yogur descremado (200 g)', 'Media medida de proteína en polvo', '1 puñadito de nueces o almendras (15 g)'],
    pasos: ['Mezclá la proteína con el yogur.', 'Sumá los frutos secos picados.']
  },
  {
    n: 'Pechuga a la plancha con ensalada completa', min: 15, t: ['Cena', 'Almuerzo'], k: 380, p: 48, c: 14, g: 14,
    ing: ['180 g de pechuga de pollo', 'Lechuga, tomate, zanahoria y huevo duro', '1 cucharadita de aceite de oliva'],
    pasos: ['Aplastá la pechuga y cocinala a la plancha 5 minutos de cada lado.', 'Armá la ensalada y condimentá.']
  },
  {
    n: 'Salmón o trucha con verduras al horno', min: 25, t: ['Cena', 'Almuerzo'], k: 450, p: 38, c: 18, g: 25,
    ing: ['160 g de salmón o trucha', 'Zapallito, morrón y cebolla', 'Limón, sal y eneldo'],
    pasos: ['Cortá las verduras y ponelas en una fuente.', 'Sumá el pescado encima con limón.', 'Horno fuerte 18 a 20 minutos.']
  },
  // Postres saludables
  {
    n: 'Yogur griego con frutas y proteína', min: 3, t: ['Postre', 'Merienda', 'Colación'], k: 280, p: 42, c: 20, g: 2,
    ing: ['1 pote de yogur griego natural (170 g)', '1 medida de proteína en polvo (vainilla o frutilla)', '1 taza de frutillas o arándanos (100 g)'],
    pasos: ['Mezclá la proteína con el yogur hasta que quede cremoso (si queda espeso, un chorrito de leche).', 'Sumá las frutas cortadas arriba.']
  },
  {
    n: 'Mousse de chocolate proteica', min: 5, t: ['Postre', 'Merienda'], k: 230, p: 28, c: 10, g: 8,
    ing: ['150 g de ricota descremada', 'Media medida de proteína sabor chocolate', '1 cucharada de cacao amargo', 'Edulcorante a gusto'],
    pasos: ['Procesá o batí todo hasta que quede liso.', 'Llevalo a la heladera 30 minutos.']
  },
  {
    n: 'Helado de banana y cacao con proteína', min: 5, t: ['Postre', 'Merienda'], k: 200, p: 14, c: 32, g: 2,
    ing: ['1 banana cortada y congelada', 'Media medida de proteína en polvo', '1 cucharadita de cacao amargo', '50 ml de leche descremada'],
    pasos: ['Procesá la banana congelada con el resto.', 'Comelo enseguida o freezer 20 minutos para que tome más cuerpo.']
  },
  {
    n: 'Flan proteico', min: 15, t: ['Postre'], k: 150, p: 15, c: 12, g: 4,
    ing: ['1 huevo y 2 claras', '200 ml de leche descremada', 'Edulcorante y esencia de vainilla', 'Rinde 2 porciones (valores por porción)'],
    pasos: ['Batí todo.', 'Repartí en 2 flaneras y cociná a baño María en horno medio 25 minutos, o en microondas 3 a 4 minutos a potencia media.', 'Enfriá en la heladera.']
  },
  {
    n: 'Brownie en taza de avena y proteína', min: 5, t: ['Postre', 'Merienda'], k: 230, p: 22, c: 25, g: 4,
    ing: ['30 g de avena', 'Media medida de proteína sabor chocolate', '1 clara', '1 cucharada de cacao amargo', '2 cucharadas de leche'],
    pasos: ['Mezclá todo en una taza.', 'Microondas 60 a 90 segundos.']
  },
  {
    n: 'Gelatina light con yogur', min: 5, t: ['Postre', 'Colación'], k: 100, p: 9, c: 13, g: 0.5,
    ing: ['1 porción de gelatina sin azúcar ya hecha', 'Medio pote de yogur descremado (100 g)'],
    pasos: ['Serví la gelatina con el yogur arriba (o mezclá el yogur con la gelatina tibia antes de que cuaje).']
  },
  {
    n: 'Manzana asada con canela y yogur', min: 15, t: ['Postre'], k: 160, p: 6, c: 32, g: 1,
    ing: ['1 manzana', 'Canela', 'Medio pote de yogur descremado (100 g)'],
    pasos: ['Cortá la manzana en gajos, espolvoreá canela.', 'Microondas 3 minutos o horno 15 minutos.', 'Serví con el yogur.']
  },
  {
    n: 'Frutillas con chocolate amargo', min: 5, t: ['Postre'], k: 150, p: 3, c: 22, g: 7,
    ing: ['200 g de frutillas', '15 g de chocolate 70% de cacao'],
    pasos: ['Derretí el chocolate 20 segundos en microondas.', 'Bañá o rociá las frutillas.']
  }
];
