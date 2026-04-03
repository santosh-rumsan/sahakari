import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GeoService } from './geo.service';

@ApiTags('geo')
@Controller('geo')
export class GeoController {
  constructor(private geo: GeoService) {}

  @Get('provinces')
  @ApiOperation({ summary: 'Get all provinces' })
  getProvinces() {
    return this.geo.getProvinces();
  }

  @Get('districts')
  @ApiOperation({ summary: 'Get districts, optionally filtered by province' })
  getDistricts(@Query('provinceId') provinceId?: string) {
    return this.geo.getDistricts(provinceId);
  }

  @Get('municipalities')
  @ApiOperation({
    summary: 'Get municipalities, optionally filtered by district',
  })
  getMunicipalities(@Query('districtId') districtId?: string) {
    return this.geo.getMunicipalities(districtId);
  }
}
