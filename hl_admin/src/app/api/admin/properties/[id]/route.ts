/* eslint-disable @typescript-eslint/no-explicit-any */
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

// GET individual property
export async function GET(
    request: NextRequest,
    context: any
) {
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

        const params = await context.params;
        const { id } = params;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { message: 'Invalid property ID' },
                { status: 400 }
            );
        }

        const [properties] = await pool.query<Property[]>(
            `SELECT id, name, home_serial, slug, img_thub, img_hero, img1, img2, img3, img4, img5, 
             video1, address, land_area, flat_size, building_type, project_status, location, 
             map_src, description, typical_floor_plan, ground_floor_plan, roof_floor_plan, agent_id 
             FROM properties WHERE id = ?`,
            [parseInt(id)]
        );

        if (properties.length === 0) {
            return NextResponse.json(
                { message: 'Property not found' },
                { status: 404 }
            );
        }

        const property = properties[0];

        // Convert Buffer data to base64 for frontend consumption
        const processedProperty = { ...property };
        const imageFields = ['img_thub', 'img_hero', 'img1', 'img2', 'img3', 'img4', 'img5', 'typical_floor_plan', 'ground_floor_plan', 'roof_floor_plan'];
        
        imageFields.forEach(field => {
            if (processedProperty[field as keyof Property]) {
                const buffer = processedProperty[field as keyof Property] as Buffer;
                processedProperty[field as keyof Property] = {
                    type: 'image/jpeg', // You might want to store the actual MIME type
                    data: buffer
                } as unknown;
            }
        });

        return NextResponse.json(processedProperty);

    } catch (error) {
        console.error('Property fetch error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT (Update) individual property
export async function PUT(
    request: NextRequest,
    context: any
) {
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

        const params = await context.params;
        const { id } = params;

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
        const [updatedProperties] = await pool.query<Property[]>(
            `SELECT id, name, home_serial, slug, img_thub, img_hero, img1, img2, img3, img4, img5, 
             video1, address, land_area, flat_size, building_type, project_status, location, 
             map_src, description, typical_floor_plan, ground_floor_plan, roof_floor_plan, agent_id 
             FROM properties WHERE id = ?`,
            [parseInt(id)]
        );

        const updatedProperty = updatedProperties[0];

        // Convert Buffer data to base64 for frontend consumption
        const processedProperty = { ...updatedProperty };
        const imageFields2 = ['img_thub', 'img_hero', 'img1', 'img2', 'img3', 'img4', 'img5', 'typical_floor_plan', 'ground_floor_plan', 'roof_floor_plan'];
        
        imageFields2.forEach(field => {
            if (processedProperty[field as keyof Property]) {
                const buffer = processedProperty[field as keyof Property] as Buffer;
                processedProperty[field as keyof Property] = {
                    type: 'image/jpeg', // You might want to store the actual MIME type
                    data: buffer
                } as unknown;
            }
        });

        return NextResponse.json({ 
            message: 'Property updated successfully',
            id: parseInt(id),
            property: processedProperty
        });

    } catch (error) {
        console.error('Property update error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE individual property
export async function DELETE(
    request: NextRequest,
    context: any
) {
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

        const params = await context.params;
        const { id } = params;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { message: 'Invalid property ID' },
                { status: 400 }
            );
        }

        // First, delete the related amenities record to avoid foreign key constraint
        try {
            await pool.execute<ResultSetHeader>(
                'DELETE FROM amenities WHERE id = ?',
                [parseInt(id)]
            );
        } catch {
            // If amenities record doesn't exist, that's fine - continue with property deletion
            console.log('No amenities record found for property:', id);
        }

        // Now delete the property
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM properties WHERE id = ?',
            [parseInt(id)]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { message: 'Property not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Property deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Property delete error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}