// Recetas fáciles para completar los macros del día (valores aproximados por porción).
// k = kcal, p = proteínas, c = carbohidratos, g = grasas (g). m = momento: 'dia' (desayuno o merienda) o 'comida' (almuerzo o cena).
window.RECETAS = [
  {
    n: 'Omelette de claras y queso', min: 10, m: 'dia', k: 230, p: 26, c: 2, g: 13,
    ing: ['3 claras y 1 huevo entero', '30 g de queso cremoso', 'Sal, pimienta, orégano'],
    pasos: ['Batí las claras con el huevo.', 'Cociná en sartén antiadherente a fuego medio.', 'Agregá el queso, doblá y tapá un minuto.']
  },
  {
    n: 'Yogur griego con avena y banana', min: 3, m: 'dia', k: 330, p: 23, c: 47, g: 5,
    ing: ['1 pote de yogur griego natural (170 g)', '3 cucharadas de avena (30 g)', 'Media banana en rodajas', 'Canela'],
    pasos: ['Poné el yogur en un bowl.', 'Sumá la avena y la banana.', 'Espolvoreá canela.']
  },
  {
    n: 'Licuado de proteína, banana y avena', min: 3, m: 'dia', k: 460, p: 37, c: 66, g: 5,
    ing: ['1 medida de proteína en polvo', '250 ml de leche descremada', '1 banana', '3 cucharadas de avena'],
    pasos: ['Poné todo en la licuadora.', 'Licuá un minuto con hielo si querés.']
  },
  {
    n: 'Tostadas con huevo revuelto y palta', min: 10, m: 'dia', k: 420, p: 22, c: 32, g: 22,
    ing: ['2 rebanadas de pan integral', '2 huevos', 'Un cuarto de palta', 'Sal y pimienta'],
    pasos: ['Tostá el pan.', 'Revolvé los huevos en sartén a fuego bajo.', 'Untá la palta y poné el huevo arriba.']
  },
  {
    n: 'Ricota con frutillas y miel', min: 3, m: 'dia', k: 260, p: 20, c: 28, g: 7,
    ing: ['150 g de ricota descremada', '1 taza de frutillas', '1 cucharadita de miel'],
    pasos: ['Poné la ricota en un bowl.', 'Sumá las frutillas cortadas y la miel.']
  },
  {
    n: 'Panqueques de avena, banana y claras', min: 10, m: 'dia', k: 330, p: 18, c: 55, g: 4,
    ing: ['40 g de avena', '1 banana pisada', '3 claras', 'Canela'],
    pasos: ['Mezclá todo hasta tener una pasta.', 'Cociná de a cucharadas en sartén antiadherente, vuelta y vuelta.']
  },
  {
    n: 'Pudding de chía con proteína', min: 5, m: 'dia', k: 300, p: 25, c: 22, g: 12,
    ing: ['2 cucharadas de chía (25 g)', 'Media medida de proteína en polvo', '200 ml de leche descremada'],
    pasos: ['Mezclá todo en un frasco.', 'Dejalo en la heladera al menos 2 horas (o de un día para el otro).']
  },
  {
    n: 'Revuelto de huevo, espinaca y ricota', min: 10, m: 'dia', k: 310, p: 25, c: 5, g: 21,
    ing: ['3 huevos', '1 taza de espinaca', '50 g de ricota descremada'],
    pasos: ['Saltá la espinaca un minuto.', 'Agregá los huevos batidos y la ricota.', 'Revolvé hasta que cuaje.']
  },
  {
    n: 'Wrap de atún', min: 5, m: 'comida', k: 330, p: 33, c: 28, g: 8,
    ing: ['1 tortilla de trigo', '1 lata de atún al natural', 'Lechuga y tomate', '1 cucharada de queso untable light'],
    pasos: ['Untá la tortilla con el queso.', 'Sumá el atún escurrido y las verduras.', 'Enrollá y cortá al medio.']
  },
  {
    n: 'Pollo al horno con batata', min: 40, m: 'comida', k: 520, p: 56, c: 41, g: 12,
    ing: ['180 g de pechuga de pollo', '200 g de batata', '1 cucharadita de aceite', 'Pimentón, ajo, sal'],
    pasos: ['Cortá la batata en cubos y el pollo en tiras.', 'Condimentá y rociá con el aceite.', 'Horno fuerte unos 30 a 35 minutos, dando vuelta a la mitad.']
  },
  {
    n: 'Milanesas de pollo al horno con ensalada', min: 30, m: 'comida', k: 470, p: 50, c: 30, g: 15,
    ing: ['2 milanesas de pollo', 'Ensalada de lechuga, tomate y zanahoria', '1 cucharadita de aceite para la ensalada'],
    pasos: ['Horno fuerte 10 a 12 minutos de cada lado.', 'Serví con la ensalada.']
  },
  {
    n: 'Bowl de arroz, carne magra y verduras', min: 20, m: 'comida', k: 560, p: 40, c: 50, g: 20,
    ing: ['150 g de arroz cocido', '150 g de carne picada magra', 'Morrón, cebolla y zapallito', 'Salsa de soja'],
    pasos: ['Dorá la carne con la cebolla.', 'Sumá las verduras en cubos.', 'Serví sobre el arroz con un chorrito de soja.']
  },
  {
    n: 'Fideos con atún y tomate', min: 15, m: 'comida', k: 470, p: 40, c: 65, g: 4,
    ing: ['80 g de fideos secos', '1 lata de atún al natural', 'Media taza de salsa de tomate', 'Albahaca u orégano'],
    pasos: ['Herví los fideos.', 'Calentá la salsa con el atún.', 'Mezclá todo.']
  },
  {
    n: 'Ensalada de lentejas y huevo', min: 10, m: 'comida', k: 420, p: 30, c: 42, g: 14,
    ing: ['1 taza de lentejas cocidas (de lata sirven)', '2 huevos duros', 'Tomate, cebolla morada, perejil', '1 cucharadita de aceite y limón'],
    pasos: ['Enjuagá las lentejas.', 'Picá las verduras y los huevos.', 'Mezclá y condimentá.']
  },
  {
    n: 'Merluza al horno con puré de calabaza', min: 25, m: 'comida', k: 290, p: 38, c: 25, g: 4,
    ing: ['200 g de filet de merluza', '250 g de calabaza', 'Limón, ajo y perejil'],
    pasos: ['Herví la calabaza y hacé puré.', 'Horneá la merluza con limón y ajo 15 minutos.', 'Serví con el puré.']
  },
  {
    n: 'Hamburguesas caseras de pollo con ensalada', min: 20, m: 'comida', k: 380, p: 45, c: 10, g: 17,
    ing: ['250 g de pollo picado', '1 huevo', 'Cebolla de verdeo, sal, pimienta', 'Ensalada a gusto'],
    pasos: ['Mezclá el pollo con el huevo y la cebolla.', 'Formá 2 medallones.', 'Cociná a la plancha 5 minutos de cada lado.']
  },
  {
    n: 'Sándwich de pollo y palta', min: 10, m: 'comida', k: 450, p: 38, c: 38, g: 15,
    ing: ['2 rebanadas de pan integral', '120 g de pollo cocido desmenuzado', 'Un cuarto de palta', 'Tomate y lechuga'],
    pasos: ['Pisá la palta sobre el pan.', 'Armá con el pollo y las verduras.']
  },
  {
    n: 'Bife de cuadril con arroz y brócoli', min: 25, m: 'comida', k: 560, p: 52, c: 48, g: 16,
    ing: ['180 g de cuadril', '150 g de arroz cocido', '1 taza de brócoli'],
    pasos: ['Cociná el bife a la plancha a tu punto.', 'Herví o cociná al vapor el brócoli.', 'Serví con el arroz.']
  },
  {
    n: 'Garbanzos salteados con huevo', min: 10, m: 'comida', k: 400, p: 22, c: 40, g: 16,
    ing: ['1 taza de garbanzos cocidos', '2 huevos', 'Cebolla, morrón y pimentón', '1 cucharadita de aceite'],
    pasos: ['Saltá la cebolla y el morrón.', 'Sumá los garbanzos y el pimentón.', 'Agregá los huevos y revolvé hasta que cuajen.']
  },
  {
    n: 'Tortilla de papa al horno con claras', min: 35, m: 'comida', k: 350, p: 24, c: 35, g: 11,
    ing: ['250 g de papa', '1 huevo y 4 claras', 'Cebolla', '1 cucharadita de aceite'],
    pasos: ['Cortá la papa en rodajas finas y hervila 8 minutos.', 'Mezclá con la cebolla y los huevos.', 'Horno medio 20 minutos en molde aceitado.']
  }
];
