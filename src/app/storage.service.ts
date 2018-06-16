import {Injectable} from '@angular/core';
import {Node, Link} from './d3';


const MY_STORAGE_KEY = 'my_storage_key';



@Injectable()
export class MyStorageService {
  // データの取り出し
  fetch(): any {
    return JSON.parse(localStorage.getItem(MY_STORAGE_KEY)) || [];
  }

  // 全削除
  clear(): void {
    localStorage.removeItem(MY_STORAGE_KEY);
  }

  // 保存
  add(d3Data: any): void {
    localStorage.setItem(MY_STORAGE_KEY, JSON.stringify(d3Data));
  }

}
