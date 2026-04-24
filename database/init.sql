-- 电影订票系统数据库初始化脚本
-- 数据库: movie_tickets

-- 创建数据库
CREATE DATABASE IF NOT EXISTS movie_tickets DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE movie_tickets;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 影院表
CREATE TABLE IF NOT EXISTS cinemas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 影厅表
CREATE TABLE IF NOT EXISTS halls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cinema_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    total_rows INT NOT NULL,
    total_cols INT NOT NULL,
    total_seats INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE,
    INDEX idx_cinema_id (cinema_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 座位表
CREATE TABLE IF NOT EXISTS seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hall_id BIGINT NOT NULL,
    seat_row INT NOT NULL,
    seat_col INT NOT NULL,
    seat_code VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE,
    INDEX idx_hall_id (hall_id),
    UNIQUE KEY uk_hall_row_col (hall_id, seat_row, seat_col)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 电影表
CREATE TABLE IF NOT EXISTS movies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    original_title VARCHAR(100),
    director VARCHAR(100),
    actors TEXT,
    genre VARCHAR(50),
    duration INT NOT NULL COMMENT '片长（分钟）',
    release_date DATE,
    description TEXT,
    poster_url VARCHAR(255),
    rating DECIMAL(3,1),
    status ENUM('COMING_SOON', 'SHOWING', 'OFFLINE') NOT NULL DEFAULT 'COMING_SOON',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 场次表（排片）
CREATE TABLE IF NOT EXISTS screenings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    hall_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    language VARCHAR(20) DEFAULT '国语',
    version VARCHAR(20) DEFAULT '2D',
    status ENUM('ACTIVE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE,
    INDEX idx_movie_id (movie_id),
    INDEX idx_hall_id (hall_id),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 座位锁定表（用于防止重复预订）
CREATE TABLE IF NOT EXISTS seat_locks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screening_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    lock_time DATETIME NOT NULL,
    expire_time DATETIME NOT NULL,
    status ENUM('LOCKED', 'CONFIRMED', 'EXPIRED') NOT NULL DEFAULT 'LOCKED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_screening_id (screening_id),
    INDEX idx_seat_id (seat_id),
    INDEX idx_user_id (user_id),
    INDEX idx_expire_time (expire_time),
    INDEX idx_status (status),
    UNIQUE KEY uk_screening_seat (screening_id, seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    screening_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    seat_count INT NOT NULL,
    status ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_time DATETIME,
    expire_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_screening_id (screening_id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单座位关联表
CREATE TABLE IF NOT EXISTS order_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    screening_id BIGINT NOT NULL,
    seat_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_seat_id (seat_id),
    INDEX idx_screening_id (screening_id),
    UNIQUE KEY uk_screening_seat_order (screening_id, seat_id, order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入初始管理员账号 (密码: admin123, 使用BCrypt加密)
INSERT INTO users (username, password, email, phone, role) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'admin@movie.com', '13800138000', 'ADMIN');

-- 插入测试影院数据
INSERT INTO cinemas (name, address, phone, description) VALUES 
('复古胶片电影院', '北京市朝阳区复古路88号', '010-88888888', '一家充满复古风情的电影院，带你回到胶片电影的黄金时代。'),
('星光影院', '上海市浦东新区星光大道168号', '021-66666666', '现代化多厅影院，提供舒适的观影体验。');

-- 插入测试影厅数据
INSERT INTO halls (cinema_id, name, total_rows, total_cols, total_seats) VALUES 
(1, '经典胶片厅', 8, 10, 80),
(1, '杜比全景声厅', 10, 12, 120),
(2, 'VIP厅', 6, 8, 48);

-- 插入测试座位数据 (为影厅1生成8x10=80个座位)
-- 由于座位较多，这里只插入示例数据，实际应用中可以通过程序批量生成
INSERT INTO seats (hall_id, seat_row, seat_col, seat_code) VALUES 
(1, 1, 1, '1排1座'), (1, 1, 2, '1排2座'), (1, 1, 3, '1排3座'), (1, 1, 4, '1排4座'), (1, 1, 5, '1排5座'),
(1, 1, 6, '1排6座'), (1, 1, 7, '1排7座'), (1, 1, 8, '1排8座'), (1, 1, 9, '1排9座'), (1, 1, 10, '1排10座'),
(1, 2, 1, '2排1座'), (1, 2, 2, '2排2座'), (1, 2, 3, '2排3座'), (1, 2, 4, '2排4座'), (1, 2, 5, '2排5座'),
(1, 2, 6, '2排6座'), (1, 2, 7, '2排7座'), (1, 2, 8, '2排8座'), (1, 2, 9, '2排9座'), (1, 2, 10, '2排10座');

-- 插入测试电影数据
INSERT INTO movies (title, original_title, director, actors, genre, duration, release_date, description, poster_url, rating, status) VALUES 
('肖申克的救赎', 'The Shawshank Redemption', '弗兰克·德拉邦特', '蒂姆·罗宾斯, 摩根·弗里曼', '剧情', 142, '1994-09-23', '一部关于希望与自由的经典之作，讲述银行家安迪被冤枉入狱后，如何在肖申克监狱中寻找希望的故事。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20movie%20poster%20shawshank%20redemption%20film%20noir%20style&image_size=portrait_4_3', 9.7, 'SHOWING'),
('教父', 'The Godfather', '弗朗西斯·福特·科波拉', '马龙·白兰度, 阿尔·帕西诺', '犯罪/剧情', 175, '1972-03-24', '黑帮电影的巅峰之作，讲述柯里昂家族的权力斗争与传承。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20movie%20poster%20godfather%20classic%20film%20style&image_size=portrait_4_3', 9.6, 'SHOWING'),
('阿甘正传', 'Forrest Gump', '罗伯特·泽米吉斯', '汤姆·汉克斯, 罗宾·怀特', '剧情/爱情', 142, '1994-07-06', '一个智商只有75的低能儿，却成就了非凡的人生传奇。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20movie%20poster%20forrest%20gump%20warm%20nostalgic%20style&image_size=portrait_4_3', 9.5, 'SHOWING'),
('泰坦尼克号', 'Titanic', '詹姆斯·卡梅隆', '莱昂纳多·迪卡普里奥, 凯特·温丝莱特', '爱情/灾难', 194, '1997-12-19', '一段跨越阶级的凄美爱情故事，在一艘注定沉没的巨轮上上演。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20movie%20poster%20titanic%20romantic%20classic%20film&image_size=portrait_4_3', 9.4, 'COMING_SOON');

-- 插入测试场次数据
INSERT INTO screenings (movie_id, hall_id, start_time, end_time, price, language, version) VALUES 
(1, 1, '2026-04-25 10:00:00', '2026-04-25 12:22:00', 35.00, '英语', '2D'),
(1, 1, '2026-04-25 14:00:00', '2026-04-25 16:22:00', 45.00, '英语', '2D'),
(1, 1, '2026-04-25 19:00:00', '2026-04-25 21:22:00', 55.00, '英语', '2D'),
(2, 2, '2026-04-25 13:00:00', '2026-04-25 15:55:00', 45.00, '英语', '2D'),
(2, 2, '2026-04-25 18:00:00', '2026-04-25 20:55:00', 55.00, '英语', '2D'),
(3, 1, '2026-04-26 10:00:00', '2026-04-26 12:22:00', 35.00, '英语', '2D');
