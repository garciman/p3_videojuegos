# Autores
- Dani Girón Rami
- Óscar Jaime Royo
- Jorge García Verdú
## Tiempo invertido:
- **Dani Girón**: 1h 30min
- **Óscar Jaime**: 1h 30 min
- **Jorge García**: 2h

# Decisiones de diseño
## Limitar la fricción
Se limita la fricción únicamente a la presente con el suelo
**Problema** Al ser el punto 2.6. ambiguo en cuanto a requisitos de implementación, considerar todos los casos supondría un aumento excesivo de complejidad
**Solución** Implementar únicamente la fricción de las esferas con el suelo

Esto conlleva que los choques entre esferas sigan siendo elásticos, y el movimiento de las esferas en el espacio, siempre que no toquen el suelo, no sufrirán ningún decremento de velocidad