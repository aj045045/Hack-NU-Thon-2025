import { toast } from 'sonner';

interface FormResponse {
    status: string;
    message: string;
}

export class UtilityHandler {
    static async onSubmitPost<T>(
        url: string,
        data: T,
        submitText: string = 'Submitting',
        successText: string = 'Submitted'
    ): Promise<void> {
        const toastId = toast.loading(submitText);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result: FormResponse = await response.json();

            if (!response.ok) {
                toast.error(result.message);
                return;
            } else {
                toast.success(successText);
            }
        } catch (error) {
            toast.error('An error occurred: ' + (error instanceof Error ? error.message : error));
        } finally {
            toast.dismiss(toastId);
        }
    }

    static async onSubmitPut<T>(
        url: string,
        data: T,
        submitText: string = 'Updating',
        successText: string = 'Updated'
    ): Promise<void> {
        const toastId = toast.loading(submitText);
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result: FormResponse = await response.json();

            if (!response.ok) {
                toast.error(result.message);
                return;
            } else {
                toast.success(successText);
            }
        } catch (error) {
            toast.error('An error occurred: ' + (error instanceof Error ? error.message : error));
        } finally {
            toast.dismiss(toastId);
        }
    }
}
