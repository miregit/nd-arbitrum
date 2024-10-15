import { Module } from "@nestjs/common"
import { AxiosService } from "./Axios.Service"

@Module({
  imports: [],
  providers: [AxiosService],
  exports: [AxiosService],
})
export class WebModule {}
