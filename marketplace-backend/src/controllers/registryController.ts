import { Request, Response } from 'express';

// The FastAPI Python engine runs locally on 8000 during dev
const PYTHON_REGISTRY_URL = process.env.REGISTRY_ENGINE_URL || 'http://localhost:8000/api/v1';

export const proposeSurvey = async (req: Request, res: Response) => {
    try {
        // Forward payload from Vite Frontend to Python Engine
        const { owner_id, surveyor_id, parent_parcel_id, coordinates } = req.body;

        const response = await fetch(`${PYTHON_REGISTRY_URL}/transactions/propose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                owner_id,
                surveyor_id,
                parent_parcel_id,
                coordinates
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: "Spatial Registry Reject",
                message: data.detail || "Overlap detected or invalid coordinates"
            });
        }

        // NOTE: Once successful, we can link data.parcel_id to a MongoDB Mortgage Listing right here.
        // e.g., await Application.findByIdAndUpdate(req.body.application_id, { registry_cleared: true, registry_parcel_id: data.parcel_id })

        res.status(200).json({
            success: true,
            message: data.message,
            parcel_id: data.parcel_id,
            hex_count: data.hex_count
        });

    } catch (error: any) {
        console.error("Python Registry Connection Error:", error);
        res.status(500).json({ success: false, error: "Failed connecting to Python Registry Engine." });
    }
};

export const approveSurvey = async (req: Request, res: Response) => {
    try {
        const { parcel_id } = req.params;
        const { landowner_id } = req.body;

        const response = await fetch(`${PYTHON_REGISTRY_URL}/transactions/${parcel_id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ landowner_id })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: "Spatial Registry Reject",
                message: data.detail
            });
        }

        res.status(200).json({
            success: true,
            message: data.message,
            status: data.status
        });

    } catch (error: any) {
        console.error("Python Registry Connection Error:", error);
        res.status(500).json({ success: false, error: "Failed connecting to Python Registry Engine." });
    }
};
