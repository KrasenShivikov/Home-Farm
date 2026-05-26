# Home Farm / Домашна ферма

## Описание на проекта

Home Farm е монорепозитори за управление на семейна зеленчукова ферма. Системата следи култури, фермерски дейности, преработени продукти, клиентски поръчки, разходи, потребители и производствена статистика.

Приложението поддържа три основни групи потребители:

- **Посетители** могат да разглеждат началната страница, да виждат наличните продукти за продажба и да се регистрират.
- **Потребители** могат да влизат в профила си, да редактират личните си данни и адрес за доставка, да създават поръчки, да редактират редове в поръчка, да следят статус и да отказват поръчки, когато това е позволено.
- **Администратори** могат да управляват култури, преработени продукти, дейности по културите, разходи, поръчки и статистики.

Основни работни процеси:

- Управление на култури като домати, краставици, пипер, картофи и други сезонни продукти.
- Записване на дейности: посев, реколта, пръскане и загуби.
- Създаване на преработени продукти от култури, например лютеница, туршия, консервирани домати и зеленчукови миксове.
- Приемане и управление на клиентски поръчки.
- Проследяване на разходи и изчисляване на обобщени справки.
- Зареждане на реалистични тестови данни на български език за проверка на производителност.

## Архитектура

Репозиторията съдържа уеб приложение и мобилно приложение. И двете използват един и същ backend API и една PostgreSQL база данни.

```text
Посетител/Потребител/Администратор
        |
        | Уеб интерфейс: браузър
        v
home-farm-web
Next.js App Router
Server Components + Server Actions + API Routes
        |
        | Drizzle ORM
        v
PostgreSQL / Neon

Мобилен потребител
        |
        | Expo / React Native приложение
        v
home-farm-mobile
REST заявки с Bearer JWT
        |
        v
home-farm-web /api/*
        |
        v
PostgreSQL / Neon
```

### Уеб приложение

Папка: `home-farm-web`

Технологии:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Drizzle ORM
- Neon serverless PostgreSQL
- JWT сесии чрез `jose`
- Хеширане на пароли чрез `bcryptjs`

Отговорности:

- Публична начална страница за нерегистрирани посетители.
- Уеб автентикация с JWT сесии в cookies.
- Админ екрани за култури, продукти, поръчки, разходи и статистики.
- Потребителски екрани за табло, профил и поръчки.
- API маршрути, използвани от мобилното приложение.
- Миграции и seed скриптове за базата данни.

### Мобилно приложение

Папка: `home-farm-mobile`

Технологии:

- Expo SDK 55
- Expo Router
- React Native
- TypeScript

Отговорности:

- Вход и регистрация през мобилното приложение.
- Мобилен профил.
- Списък с поръчки и детайли за поръчка.
- Създаване на поръчка, редакция на редове и отказване на поръчка.
- Комуникация с уеб backend чрез REST API заявки.

Мобилното приложение използва `EXPO_PUBLIC_API_BASE_URL`, когато е зададен. Ако не е зададен, използва `http://localhost:3000/api`.

### Backend и API

Backend частта е реализирана в Next.js уеб приложението:

- Server Actions в `home-farm-web/src/actions`
- REST API маршрути в `home-farm-web/src/app/api`
- Схема на базата данни в `home-farm-web/src/db/schema.ts`
- Database client в `home-farm-web/src/db/index.ts`

Важни API групи:

- `POST /api/auth/login` - вход
- `POST /api/auth/register` - регистрация
- `GET /api/profile` - зареждане на профил
- `PATCH /api/profile` - редакция на профил
- `GET /api/crops` - списък с култури
- `GET /api/orders` - списък с поръчки
- `POST /api/orders` - създаване на поръчка
- `GET /api/orders/:id` - детайли за поръчка
- `DELETE /api/orders/:id` - изтриване или отказване на поръчка
- `POST /api/orders/:id/edit` - промяна на статус
- `POST /api/orders/:id/create_order_line` - добавяне на ред към поръчка
- `PATCH /api/orders/:id/lines/:lineId` - редакция на ред от поръчка
- `DELETE /api/orders/:id/lines/:lineId` - изтриване на ред от поръчка

API документацията е достъпна локално на:

```text
http://localhost:3000/api/docs
```

## Дизайн на базата данни

Базата данни е PostgreSQL и се управлява чрез Drizzle ORM миграции. Основните връзки са показани по-долу.

```mermaid
erDiagram
  USERS ||--o{ ORDERS : creates
  ORDERS ||--o{ ORDER_LINES : contains
  CROPS ||--o{ ORDER_LINES : ordered_as

  CROPS ||--o{ PLANTINGS : has
  CROPS ||--o{ HARVESTINGS : has
  CROPS ||--o{ SPRAYINGS : has
  CROPS ||--o{ WASTES : has

  CROPS ||--o{ CROP_PRODUCTS : used_in
  PRODUCTS ||--o{ CROP_PRODUCTS : contains

  EXPENCES_TYPE ||--o{ EXPENCES : categorizes

  USERS {
    int id PK
    text name
    varchar email UK
    text password_hash
    enum role
    text shipping_city
    text shipping_street
    text shipping_postal_code
    text shipping_country
  }

  CROPS {
    int id PK
    text name
    text variety
    boolean for_sale
    numeric price
    text description
  }

  PLANTINGS {
    int id PK
    date date
    numeric quantity
    enum type
    int crop_id FK
    text description
  }

  HARVESTINGS {
    int id PK
    date date
    numeric quantity
    int crop_id FK
    text description
  }

  SPRAYINGS {
    int id PK
    date date
    numeric quantity
    int crop_id FK
    text description
  }

  WASTES {
    int id PK
    date date
    numeric quantity
    enum type
    int crop_id FK
    text description
  }

  PRODUCTS {
    int id PK
    text name
    date date
    numeric quantity
    numeric price
  }

  CROP_PRODUCTS {
    int crop_id PK,FK
    int product_id PK,FK
    numeric quantity
  }

  ORDERS {
    int id PK
    int user_id FK
    text status
    timestamp created_at
    text shipping_city
    text shipping_street
    text shipping_postal_code
    text shipping_country
  }

  ORDER_LINES {
    int id PK
    int order_id FK
    int crop_id FK
    numeric quantity
    numeric price
  }

  EXPENCES_TYPE {
    int id PK
    text name
  }

  EXPENCES {
    int id PK
    text name
    int expences_type_id FK
    text description
    date date
    numeric value
  }
```

Индексите за производителност са дефинирани в `home-farm-web/src/db/schema.ts` и в миграциите в `home-farm-web/drizzle`.

## Структура на репозиторията

```text
home-farm/
|-- package.json
|-- package-lock.json
|-- Readme.md
|-- README_EN.md
|-- README_BG.md
|-- home-farm-web/
|   |-- src/app/
|   |   |-- api/                 # REST API и документация
|   |   |-- admin/               # Админ страници
|   |   `-- ...                  # Публични и потребителски маршрути
|   |-- src/actions/             # Server Actions и DB логика
|   |-- src/components/          # React UI компоненти
|   |-- src/db/
|   |   |-- schema.ts            # Drizzle схема
|   |   |-- index.ts             # Клиент за базата данни
|   |   `-- seed.ts              # Тестови данни на български
|   |-- src/lib/                 # Сесии, auth и помощни функции
|   |-- drizzle/                 # SQL миграции
|   |-- drizzle.config.ts
|   `-- package.json
`-- home-farm-mobile/
    |-- src/app/                 # Expo Router екрани
    |-- src/components/          # Мобилни UI компоненти
    |-- src/contexts/            # Auth и сесии
    |-- src/lib/api.ts           # REST API клиент
    |-- scripts/expo-cli.cjs     # Expo launcher за workspace
    `-- package.json
```

## Локална разработка

### Изисквания

- Node.js 22 или по-нова версия
- npm
- PostgreSQL, Neon или друга Postgres-съвместима база
- Expo Go или емулатор/устройство за мобилното приложение

### 1. Клониране и инсталация

```bash
git clone <repo-url>
cd home-farm
npm install
```

### 2. Конфигурация на средата

Създайте `.env` файл в root папката:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

За мобилна разработка към backend, който не е локален:

```bash
EXPO_PUBLIC_API_BASE_URL=http://YOUR_MACHINE_IP:3000/api
```

Бележки:

- `DATABASE_URL` се използва от уеб приложението, миграциите и seed скрипта.
- `JWT_SECRET` подписва web cookies и mobile bearer tokens.
- `CORS_ALLOWED_ORIGINS` трябва да е изрично зададен в production.
- На реално мобилно устройство `localhost` сочи към телефона, не към компютъра.

### 3. Стартиране на миграциите

```bash
npm run db:migrate -w home-farm-web
```

### 4. По желание: зареждане на тестови данни

Това изчиства основните таблици и добавя над 20 000 смислени записа на български език.

```bash
npm run db:seed -w home-farm-web
```

Тестов вход:

```text
klient.0001@example.bg / password123
```

### 5. Стартиране на dev сървърите

Стартиране на уеб и мобилно приложение заедно:

```bash
npm run dev
```

Или поотделно:

```bash
npm run dev -w home-farm-web
npm run start -w home-farm-mobile
```

Отворете уеб приложението:

```text
http://localhost:3000
```

За мобилното приложение използвайте инструкциите от Expo терминала, за да отворите Expo Go, Android емулатор, iOS симулатор или web preview.

### 6. Полезни команди

```bash
npm run build
npm run lint -w home-farm-web
npm run lint -w home-farm-mobile
npm run db:generate -w home-farm-web
npm run db:migrate -w home-farm-web
npm run db:seed -w home-farm-web
```

## Бележки за deployment

Уеб приложението може да се deploy-не като Next.js приложение. Мобилното приложение може да се export-не или build-не чрез Expo/EAS. Тъй като проектите са отделни workspaces, deploy-вайте всеки проект от неговата папка:

- Основна папка за web: `home-farm-web`
- Основна папка за mobile: `home-farm-mobile`

За production конфигурирайте:

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`
- `EXPO_PUBLIC_API_BASE_URL` за mobile build-ове
