/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Amenity extends RowDataPacket {
  id: number;
  slug: string;
  beds: number | null;
  baths: number | null;
  balconies: number | null;
  drawing: number | null;
  dining: number | null;
  kitchen: number | null;
  family_living: number | null;
  servant_bed: number | null;
  'Car Parking': number | null;
  'Servant Bed': number | null;
  'Sub-station': number | null;
  Generator: number | null;
  Elevator: number | null;
  'CC Camera': number | null;
  'Conference Room': number | null;
  'Health Club': number | null;
  'Prayer Zone': number | null;
  'BBQ Zone': number | null;
  'Child Corner': number | null;
  Gardening: number | null;
  'Swimming Pool': number | null;
  Fountain: number | null;
}

interface CustomJwtPayload extends JwtPayload {
  userId: number;
  role: string;
}

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const { id } = params;
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token) as CustomJwtPayload;
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'project_manager')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const [result] = await pool.query<Amenity[]>(
      'SELECT * FROM amenities WHERE id = ?',
      [id]
    );

    if (!result.length) {
      return NextResponse.json({ message: 'Amenities not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Amenities fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token) as CustomJwtPayload;
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'project_manager')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ message: 'Invalid property ID' }, { status: 400 });
    }

    const data: Partial<Amenity> = await request.json();

    if (!data.slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    // Include the property ID in the insert
    const columns = ['id', 'slug'];
    const placeholders = ['?', '?'];
    const values = [parseInt(id), data.slug];

    for (const key in data) {
      if (key !== 'slug' && key !== 'id' && data[key] !== undefined) {
        columns.push(`\`${key}\``);
        placeholders.push('?');
        values.push(data[key]);
      }
    }

    await pool.execute<ResultSetHeader>(
      `REPLACE INTO amenities (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
      values
    );

    const [newAmenity] = await pool.query<Amenity[]>(
      'SELECT * FROM amenities WHERE id = ?',
      [parseInt(id)]
    );

    return NextResponse.json(newAmenity[0]);
  } catch (error) {
    console.error('Amenity creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const { id } = params;
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token) as CustomJwtPayload;
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'project_manager')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data: Partial<Amenity> = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    const updateFields = [];
    const queryParams = [];

    for (const key in data) {
      if (key !== 'id' && data[key] !== undefined) {
        updateFields.push(`\`${key}\` = ?`);
        queryParams.push(data[key]);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    queryParams.push(id);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE amenities SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Amenities not found or no changes made' },
        { status: 404 }
      );
    }

    const [updatedAmenity] = await pool.query<Amenity[]>(
      'SELECT * FROM amenities WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedAmenity[0]);
  } catch (error) {
    console.error('Amenity update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const { id } = params;
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token) as CustomJwtPayload;
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'project_manager')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM amenities WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Amenities not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Amenities deleted successfully' });
  } catch (error) {
    console.error('Amenity deletion error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
