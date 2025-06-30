// rpc-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost) {
        const error = exception.getError();
        let errorMessage: string;
        let errorStatus: number;

        if (typeof error === 'string') {
            errorMessage = error;
            errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        } else if (typeof error === 'object' && error !== null) {
            errorMessage = (error as any).message || 'An error occurred';
            errorStatus = (error as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
        } else {
            errorMessage = 'An error occurred';
            errorStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        // Return an object that will be sent to the client
        return { message: errorMessage, status: errorStatus };
    }
}
