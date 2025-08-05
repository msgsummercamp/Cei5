-- Clean previous data
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE flights CASCADE;
TRUNCATE TABLE cases CASCADE;
TRUNCATE TABLE reservations CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE userdetails CASCADE;

-- Insert UserDetails
INSERT INTO userdetails (id, phone_number, address, postal_code, birth_date)
VALUES
    ('11111111-1111-1111-1111-111111111111', '+1234567890', '123 Main Street', '10001', '1990-05-12'),
    ('22222222-2222-2222-2222-222222222222', '+1987654321', '456 Elm Street', '20002', '1985-11-23');

-- Insert Users
INSERT INTO users (id, email, password, first_name, last_name, role, user_details_id, is_first_login)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'john.doe@example.com', '$2a$12$IncqVqp3IfzRhuYMLdSo7O4cQsdS2J3E8cUq6uqraCPkXb2j23LYi', 'John', 'Doe', 'ADMIN', '11111111-1111-1111-1111-111111111111', true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'jane.smith@example.com', '$2a$12$a/3QU997zt.FMK/zUaVNv.UmL8PA7bs3Dvvrc2QNAWSLiMxv3q5qy', 'Jane', 'Smith', 'USER', '22222222-2222-2222-2222-222222222222', false);

-- Insert Reservations
INSERT INTO reservations (id, reservation_number)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'ABC123'),
    ('44444444-4444-4444-4444-444444444444', 'XYZ789');

-- Insert Flights
INSERT INTO flights (id, flight_date, flight_number, departing_airport, destination_airport, departure_time, arrival_time, reservation_id, air_line, is_problematic)
VALUES
    (
        '77777777-7777-7777-7777-777777777777',
        '2024-03-15',
        'LH123',
        'JFK',
        'LHR',
        '2024-03-15 08:00:00',
        '2024-03-15 20:00:00',
        '33333333-3333-3333-3333-333333333333',
        'Lufthansa',
        false
    ),
    (
        '88888888-8888-8888-8888-888888888888',
        '2024-04-10',
        'AF456',
        'CDG',
        'JFK',
        '2024-04-10 10:00:00',
        '2024-04-10 14:30:00',
        '44444444-4444-4444-4444-444444444444',
        'AirFrance',
        true
    );

-- Insert Cases
INSERT INTO cases (id, status, disruption_reason, disruption_info, date, client_id, assigned_colleague_id, reservation_id)
VALUES
    (
        '55555555-5555-5555-5555-555555555555',
        'PENDING',
        'ARRIVED_3H_LATE',
        'Flight delayed due to storm conditions',
        '2024-03-15',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        'VALID',
        'CANCELATION_ON_DAY_OF_DEPARTURE',
        'Technical issues caused a major delay',
        '2024-04-10',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '44444444-4444-4444-4444-444444444444'
    );

-- Insert Documents
INSERT INTO documents (id, name, type, content, case_entity_id)
VALUES
    (
        '99999999-9999-9999-9999-999999999999',
        'boarding_pass',
        'PDF',
        decode('255044462d312e', 'hex'),
        '55555555-5555-5555-5555-555555555555'
    ),
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        'ticket_scan',
        'JPEG',
        decode('ffd8ffe000104a46', 'hex'),
        '66666666-6666-6666-6666-666666666666'
    );

-- Insert Comments
INSERT INTO comments (id, user_id, text, timestamp, case_entity_id)
VALUES
    (
        '12121212-1212-1212-1212-121212121212',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Client submitted required documents.',
        NOW(),
        '55555555-5555-5555-5555-555555555555'
    ),
    (
        '13131313-1313-1313-1313-131313131313',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Case assigned to John for verification.',
        NOW(),
        '66666666-6666-6666-6666-666666666666'
    );