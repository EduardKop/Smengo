import { z } from 'zod'

// «Вид» грида организации: тумблеры «Отображения» + визуалы карточек статусов.
// Формат карточки повторяет CustomCellConfig демо (grid-preview.tsx):
// single/split до 3 секторов, у сектора текст/эмодзи/цвета; темы single или
// раздельные light/dark.

const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/)

const CellSectorSchema = z.object({
  text: z.string().max(24),
  emoji: z.string().max(8),
  logo: z.string().max(24),
  color: HexColor,
  textColor: HexColor,
})

const CellBodySchema = z.object({
  mode: z.enum(['single', 'split']),
  sectorCount: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  sectors: z.array(CellSectorSchema).min(1).max(3),
})

export const CardVisualSchema = CellBodySchema.extend({
  themeMode: z.enum(['single', 'split']),
  themes: z
    .object({
      light: CellBodySchema,
      dark: CellBodySchema,
    })
    .optional(),
})

export const GridViewSettingsSchema = z.object({
  showTimes: z.boolean().optional(),
  merged: z.boolean().optional(),
  showGrid: z.boolean().optional(),
  // Группировка строк по отделам. false = единый список всех сотрудников без
  // заголовков отделов (как «все в одном графике» в демо). По умолчанию true.
  groupByDept: z.boolean().optional(),
  showEmployeeDepartment: z.boolean().optional(),
  showEmployeeRole: z.boolean().optional(),
  showEmployeeDot: z.boolean().optional(),
  // ключ — id типа статуса (системного или кастомного); системные строки
  // status_types общие, их переопределения живут только здесь
  cardVisuals: z.record(z.string().uuid(), CardVisualSchema).optional(),
})

export type CardVisual = z.infer<typeof CardVisualSchema>
export type GridViewSettings = z.infer<typeof GridViewSettingsSchema>
