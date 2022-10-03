import axios, { AxiosResponse } from 'axios';

// all references to axios are localized here

// where to send the requests
axios.defaults.baseURL = 'https://rest-example.covey.town';

export async function remoteGet<T>(path: string): Promise<T> {
  const response: AxiosResponse<T> = await axios.get(path);
  return response.data;
}

export async function remoteDelete<T>(path: string): Promise<T> {
  const response: AxiosResponse<T> = await axios.delete(path);
  return response.data;
}

// TODO in the future we should re-factor this whole example to use a Swagger/OpenAPI definition, which
// will allow us to then auto-generate a well-typed client and server. For now, we will have to permit this 'any'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export async function remotePost<T>(path: string, data?: any): Promise<T> {
  const response: AxiosResponse<T> = await axios.post(path, data);
  return response.data;
}
