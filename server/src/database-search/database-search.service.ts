import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseSearchService {
  processFiltering(matchCriteria: any, searchValue: string, dataFields: any[]) {
    if (!matchCriteria) {
      matchCriteria = {};
    }
    const searchArray = this.processSearch(searchValue, dataFields);
    if (searchArray && searchArray.length > 0) {
      const matchOrCriteria = matchCriteria['$and'];
      if (matchOrCriteria && matchOrCriteria.length > 0) {
        matchCriteria['$and'].push({ $or: searchArray });
      } else {
        matchCriteria['$and'] = [{ $or: searchArray }];
      }
    }

    return matchCriteria;
  }

  processSearch(
    searchValue: string,
    dataFields: {
      data: string;
      dataType: 'string' | 'currency' | 'boolean';
    }[],
  ) {
    const whereCondition = [];
    if (dataFields.length > 0 && searchValue && searchValue.toString().trim()) {
      searchValue = searchValue.trim().toLowerCase();
      dataFields.forEach((dataField) => {
        const dataFieldKey = dataField.data;
        const whereObj = {};

        if (dataField.dataType === 'currency') {
          whereObj[dataFieldKey] = +searchValue;
        } else if (dataField.dataType === 'boolean') {
          if (searchValue === 'completed') {
            whereObj[dataFieldKey] = true;
          } else if (searchValue === 'incomplete') {
            whereObj[dataFieldKey] = false;
          }
        } else {
          whereObj[dataFieldKey] = { $regex: searchValue, $options: 'i' };
        }

        if (whereObj && Object.keys(whereObj).length > 0) {
          whereCondition.push(whereObj);
        }
      });
    }

    return whereCondition;
  }
}
