import axios, { AxiosInstance } from 'axios';
import { getBackendAPIAddress } from './store';

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
                baseURL: getBackendAPIAddress(),
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