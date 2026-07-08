import type { LeadCardField } from '@/types'

/** Группа полей карточки (для аккуратной раскладки по разделам). */
export type FieldGroup = { titleKey: string; fields: LeadCardField[] }

/** Раскладка «Мои данные»: Личное · Бизнес · Финансы. */
export const LEAD_CARD_GROUPS: FieldGroup[] = [
  {
    titleKey: 'leadcard.groupPersonal',
    fields: ['age', 'job_status', 'start_date', 'buddy'],
  },
  {
    titleKey: 'leadcard.groupBusiness',
    fields: ['niche', 'company_name', 'point_a', 'point_b', 'artifact'],
  },
  {
    titleKey: 'leadcard.groupFinance',
    fields: [
      'earned_total',
      'plan_month',
      'fact_month',
      'avg_check',
      'margin',
      'pqb',
      'debt_was',
      'debt_left',
    ],
  },
]

/** Ключ перевода подписи для каждого поля. */
export const LEAD_CARD_LABEL: Record<LeadCardField, string> = {
  age: 'leadcard.age',
  job_status: 'leadcard.jobStatus',
  start_date: 'leadcard.startDate',
  buddy: 'leadcard.buddy',
  niche: 'leadcard.niche',
  company_name: 'leadcard.companyName',
  point_a: 'leadcard.pointA',
  point_b: 'leadcard.pointB',
  artifact: 'leadcard.artifact',
  earned_total: 'leadcard.earnedTotal',
  plan_month: 'leadcard.planMonth',
  fact_month: 'leadcard.factMonth',
  avg_check: 'leadcard.avgCheck',
  margin: 'leadcard.margin',
  pqb: 'leadcard.pqb',
  debt_was: 'leadcard.debtWas',
  debt_left: 'leadcard.debtLeft',
}
