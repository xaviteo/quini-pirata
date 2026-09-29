# Histórico Quini 6 (máximo disponible en fuentes públicas)

Armado el 28/09/2026. No es un archivo oficial de Lotería de Santa Fe.

## Qué hay

- `quini6_historico.csv` — una fila por sorteo, 4 modalidades
- `quini6_historico_long.csv` — una fila por modalidad (mejor para frecuencias)
- `quini6_historico.json` — mismo contenido en JSON

Columnas del CSV ancho:

`sorteo,fecha,tradicional,segunda,revancha,siempre_sale,fuentes`

Los 6 números de cada modalidad van ordenados de menor a mayor, no en orden de extracción.

## Cobertura

- 1934 sorteos únicos
- 7736 filas por modalidad
- Las 4 modalidades completas en los 1934 sorteos
- Sorteo 1279 (2006-01-04) al sorteo 3412 (2026-09-27)

Por año:

- 2006–2017: casi completo
- 2018: parcial (hasta ~sorteo 2569)
- 2019: no está
- 2020: parcial (desde ~sorteo 2756)
- 2021–2026: casi completo hasta el 27/09/2026

Hueco grande: sorteos 2570–2755 (186 concursos, aprox. mediados 2018 a 2020). El blog fuente no tiene esas entradas.

## Fuentes

1. CSV del crawler público https://github.com/imanzano/Quini6-Crawler (2006–2017)
2. Feed Atom/JSON de https://www.quini-6.com.ar/ (2012–2026)

Verificá un sample contra:
https://www.loteriasantafe.gov.ar/index.php/resultados/quini-6

## Lo que no existe en público

El Quini 6 empezó el 7/8/1988 (sorteo 1, bolillas 1–30: 03-04-05-13-23-26).
No hay dataset público completo 1988–2005.

Cambios de reglamento a lo largo del tiempo:

- 1988: 6 de 30
- 1994: se suma Revancha y cambia la ecuación
- 1996: universo a 42
- 1998: dos sorteos por semana
- Hoy: 6 de 46 (00 al 45), Tradicional + Segunda + Revancha + Siempre Sale

No mezcles eras si calculás frecuencias.

## Nota sobre “predicción”

Cada extracción, si el bombo está bien, es independiente. El histórico sirve para estadísticas descriptivas, no para cambiar la probabilidad del próximo sorteo.
