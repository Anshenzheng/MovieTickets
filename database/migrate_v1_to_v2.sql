-- 数据库迁移脚本：将 ENUM 类型改为 VARCHAR 类型
-- 用于修复 JPA EnumType.STRING 与 MySQL ENUM 类型不兼容的问题
-- 如果您已经执行过旧的 init.sql，请执行此脚本

USE movie_tickets;

-- 1. 修改 users 表的 role 列
ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- 2. 修改 movies 表的 status 列
ALTER TABLE movies MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'COMING_SOON';

-- 3. 修改 screenings 表的 status 列
ALTER TABLE screenings MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- 4. 修改 seat_locks 表的 status 列
ALTER TABLE seat_locks MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'LOCKED';

-- 5. 修改 orders 表的 status 列
ALTER TABLE orders MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- 验证修改结果
SHOW COLUMNS FROM users;
SHOW COLUMNS FROM movies;
SHOW COLUMNS FROM screenings;
SHOW COLUMNS FROM seat_locks;
SHOW COLUMNS FROM orders;

SELECT '数据库迁移完成！所有 ENUM 列已改为 VARCHAR 类型。' AS message;
