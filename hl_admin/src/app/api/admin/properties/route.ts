import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Property extends RowDataPacket {
    id: number;
    name: string;
    home_serial: number;
    slug: string;
    img_thub: Buffer | null;
    img_hero: Buffer | null;
    img1: Buffer | null;
    img2: Buffer | null;
    img3: Buffer | null;
    img4: Buffer | null;
    img5: Buffer | null;
    video1: string;
    address: string;
    land_area: string;
    flat_size: string;
    building_type: string;
    project_status: string;
    location: string;
    map_src: string;
    description: string;
    typical_floor_plan: Buffer | null;
    ground_floor_plan: Buffer | null;
    roof_floor_plan: Buffer | null;
    agent_id: number | null;
}

interface CustomJwtPayload extends JwtPayload {
    userId: number;
    role: string;
}

export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = await verifyToken(token) as CustomJwtPayload;
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'project_manager')) {
            return NextResponse.json(
                { message: 'Forbidden' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const userId = searchParams.get('user_id');
        const projectStatus = searchParams.get('project_status');
        const location = searchParams.get('location');

        // Only select minimal fields for the list
        let query = `SELECT id, name, home_serial, slug, project_status, location, address FROM properties`;
        let countQuery = "SELECT COUNT(*) as count FROM properties";
        const whereConditions = [];
        const queryParams = [];

        // Add userId filter if it exists
        if (userId) {
            whereConditions.push("user_id = ?");
            queryParams.push(userId);
        }

        // Add project_status filter if it exists and is not 'default'
        if (projectStatus && projectStatus !== 'default') {
            whereConditions.push("project_status = ?");
            queryParams.push(projectStatus);
        }

        // Add location filter if it exists and is not 'default'
        if (location && location !== 'default') {
            whereConditions.push("location = ?");
            queryParams.push(location);
        }

        // Build the final query with WHERE clause if needed
        if (whereConditions.length > 0) {
            const whereClause = whereConditions.join(" AND ");
            query += " WHERE " + whereClause;
            countQuery += " WHERE " + whereClause;
        }

        // Add ordering by home_serial (nulls last)
        query += " ORDER BY CASE WHEN home_serial IS NULL THEN 1 ELSE 0 END, home_serial ASC";

        // Add pagination
        const offset = (page - 1) * pageSize;
        query += " LIMIT ? OFFSET ?";
        queryParams.push(pageSize, offset);

        // Execute queries
        const [properties] = await pool.query(query, queryParams);
        const [countRows] = await pool.query<RowDataPacket[]>(countQuery, queryParams.slice(0, -2));
        const totalCount = (countRows[0] as { count: number }).count;

        // No need to process images or large fields
        return NextResponse.json({
            properties,
            total: totalCount
        });
    } catch (error) {
        console.error('Properties fetch error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        // Start transaction
        await connection.beginTransaction();

        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = await verifyToken(token) as CustomJwtPayload;
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'project_manager')) {
            return NextResponse.json(
                { message: 'Forbidden' },
                { status: 403 }
            );
        }

        // Parse FormData instead of JSON
        const formData = await request.formData();
        
        // Extract text fields from FormData
        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const home_serial = formData.get('home_serial') as string;
        const land_area = formData.get('land_area') as string;
        const flat_size = formData.get('flat_size') as string;
        const building_type = formData.get('building_type') as string;
        const project_status = formData.get('project_status') as string;
        const location = formData.get('location') as string;
        const address = formData.get('address') as string;
        const video1 = formData.get('video1') as string || '';
        const description = formData.get('description') as string || '';
        const map_src = formData.get('map_src') as string || '';
        const agent_id = formData.get('agent_id') as string;

        // Validate required fields
        if (!name || !slug || !land_area || !flat_size || !building_type || !project_status || !location || !address) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Handle image files
        const imageFields = ['img_thub', 'img_hero', 'img1', 'img2', 'img3', 'img4', 'img5', 'typical_floor_plan', 'ground_floor_plan', 'roof_floor_plan'];
        const imageBuffers: { [key: string]: Buffer | null } = {};

        for (const field of imageFields) {
            const file = formData.get(field) as File;
            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                imageBuffers[field] = Buffer.from(bytes);
            } else {
                imageBuffers[field] = null;
            }
        }

        // Ensure img_thub is required
        if (!imageBuffers['img_thub']) {
            return NextResponse.json(
                { message: 'Thumbnail image is required' },
                { status: 400 }
            );
        }

        // Insert property
        const [result] = await connection.execute(
            `INSERT INTO properties (
                name, slug, home_serial, land_area, flat_size, building_type, 
                project_status, location, address, video1, description, map_src, agent_id,
                img_thub, img_hero, img1, img2, img3, img4, img5, 
                typical_floor_plan, ground_floor_plan, roof_floor_plan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, slug, home_serial ? parseInt(home_serial) : null, land_area, flat_size,
                building_type, project_status, location, address, video1, description, map_src,
                agent_id ? parseInt(agent_id) : null,
                imageBuffers['img_thub'], imageBuffers['img_hero'], imageBuffers['img1'],
                imageBuffers['img2'], imageBuffers['img3'], imageBuffers['img4'], imageBuffers['img5'],
                imageBuffers['typical_floor_plan'], imageBuffers['ground_floor_plan'], imageBuffers['roof_floor_plan']
            ]
        ) as unknown as [{ insertId: number }];

        // Commit transaction
        await connection.commit();

        // Fetch the newly created property
        const [newProperty] = await connection.execute(
            'SELECT * FROM properties WHERE id = ?',
            [result.insertId]
        ) as unknown as [Property[]];

        return NextResponse.json({ 
            message: 'Property created successfully',
            id: result.insertId,
            property: newProperty[0]
        }, { status: 201 });

    } catch (error) {
        // Rollback transaction on error
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Rollback error:', rollbackError);
            }
        }

        console.error('Property creation error:', error);
        
        // Check for specific database errors
        if (error instanceof Error) {
            if (error.message.includes('Duplicate entry')) {
                return NextResponse.json(
                    { message: 'Property with this slug already exists' },
                    { status: 409 }
                );
            }
            if (error.message.includes('Connection lost')) {
                return NextResponse.json(
                    { message: 'Database connection error. Please try again.' },
                    { status: 503 }
                );
            }
        }
        
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        // Release the connection back to the pool
        if (connection) {
            try {
                connection.release();
            } catch (releaseError) {
                console.error('Error releasing connection:', releaseError);
            }
        }
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = await verifyToken(token) as CustomJwtPayload;
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'project_manager')) {
            return NextResponse.json(
                { message: 'Forbidden' },
                { status: 403 }
            );
        }

        // Get property ID from URL - this would need to be handled in [id]/route.ts
        // For now, we'll extract it from the request if it's included
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const id = pathParts[pathParts.length - 1];

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { message: 'Invalid property ID' },
                { status: 400 }
            );
        }

        // Parse FormData
        const formData = await request.formData();
        
        // Extract text fields from FormData
        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const home_serial = formData.get('home_serial') as string;
        const land_area = formData.get('land_area') as string;
        const flat_size = formData.get('flat_size') as string;
        const building_type = formData.get('building_type') as string;
        const project_status = formData.get('project_status') as string;
        const location = formData.get('location') as string;
        const address = formData.get('address') as string;
        const video1 = formData.get('video1') as string || '';
        const description = formData.get('description') as string || '';
        const map_src = formData.get('map_src') as string || '';
        const agent_id = formData.get('agent_id') as string;

        // Validate required fields
        if (!name || !slug || !land_area || !flat_size || !building_type || !project_status || !location || !address) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Handle image files and deletions
        const imageFields = ['img_thub', 'img_hero', 'img1', 'img2', 'img3', 'img4', 'img5', 'typical_floor_plan', 'ground_floor_plan', 'roof_floor_plan'];
        const updateFields = [];
        const updateValues = [];

        // Add text fields to update
        updateFields.push('name = ?', 'slug = ?', 'home_serial = ?', 'land_area = ?', 'flat_size = ?', 
                         'building_type = ?', 'project_status = ?', 'location = ?', 'address = ?', 
                         'video1 = ?', 'description = ?', 'map_src = ?', 'agent_id = ?');
        updateValues.push(name, slug, home_serial ? parseInt(home_serial) : null, land_area, flat_size, 
                         building_type, project_status, location, address, video1, description, map_src, 
                         agent_id ? parseInt(agent_id) : null);

        // Handle image updates/deletions
        for (const field of imageFields) {
            // Check if this image should be deleted
            const deleteFlag = formData.get(`${field}_delete`);
            if (deleteFlag === 'true') {
                updateFields.push(`${field} = ?`);
                updateValues.push(null);
                continue;
            }

            // Check if there's a new file for this field
            const file = formData.get(field) as File;
            if (file && file.size > 0) {
                const bytes = await file.arrayBuffer();
                updateFields.push(`${field} = ?`);
                updateValues.push(Buffer.from(bytes));
            }
            // If no file and no delete flag, keep existing image (don't update)
        }

        // Add the property ID for the WHERE clause
        updateValues.push(parseInt(id));

        // Execute update
        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE properties SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { message: 'Property not found' },
                { status: 404 }
            );
        }

        // Fetch the updated property
        const [updatedProperty] = await pool.query<Property[]>(
            'SELECT * FROM properties WHERE id = ?',
            [parseInt(id)]
        );

        return NextResponse.json({ 
            message: 'Property updated successfully',
            id: parseInt(id),
            property: updatedProperty[0]
        });

    } catch (error) {
        console.error('Property update error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}