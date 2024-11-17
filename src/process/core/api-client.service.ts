import axios, { AxiosInstance } from 'axios';

function applyInterceptor(apiClient: AxiosInstance) {

    apiClient.interceptors.request.use(
        async (config) => {

            const hasRequiresTokenConfig = ('requiresToken' in config);

            if (!hasRequiresTokenConfig || (hasRequiresTokenConfig && config.requiresToken !== false)) {

                const token = await APIClientService.getToken();
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
}

export class APIClientService {

    private static apiClient: AxiosInstance;
    private static token: string;

    static getToken() {

        return Promise.resolve('xyz');
    }

    static getClient() {

        if (!this.apiClient) {

            this.apiClient = axios.create({
                baseURL: 'http://localhost:3000',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            applyInterceptor(this.apiClient);
        }

        return this.apiClient;
    }

    static post<T>(...args: Parameters<AxiosInstance['post']>) {

        return this.getClient().post<T>(...args);
    }
}