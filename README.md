This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Анонсы (Announcements) — на паузе

Кнопка-рупор в шапке продукт-зоны открывает панель «Анонсы», выезжающую справа
(зеркало левого сайдбара). Функционал поставлен на паузу решением основателя
(2026-06-13) — сейчас панель показывает пустое состояние.

Концепция на будущее:
- владельцы и менеджеры публикуют новости/объявления организации;
- все участники организации видят ленту анонсов в этой панели;
- потребуется таблица `announcements` (org_id, author_id, title, body,
  created_at + RLS: читают члены организации, пишут owner/admin/manager)
  и, позже, отметки о прочтении.

---

## Система опозданий — планируется (видение основателя, 2026-06-13)

Опоздание не должно быть ручным статусом. Оно вычисляется из расписания работы
сотрудника. Детально настраивается в **настройках проекта/организации**.

- **Пресеты почасовок** — именованные окна смен (напр. «Утро 08:00–16:00»),
  хранятся в БД, привязаны к таймзоне проекта. Настраиваются в настройках проекта.
- Пресет **назначается сотруднику**; ожидаемое время выхода = пресет + таймзона
  проекта.
- **Два режима фиксации опоздания** (переключаются в настройках проекта):
  1. **Авто по часам** — сравнение фактического выхода с ожидаемым по пресету в
     таймзоне проекта; плажка ставится автоматически.
  2. **Через Telegram** — утренний пуш сотруднику «вы вышли на смену?»; от его
     ответа/времени ответа зависит, ставить ли плажку. **Telegram пока не
     реализован** — этот режим включится после этапа 5 (бот).
- В гриде опоздание показывается **плажкой/бейджем поверх рабочей смены**, не
  отдельным блоком «Опозд.».

Детали и Definition of Done — в `ROADMAP.md`, «Этап 4.5 — Система опозданий».
