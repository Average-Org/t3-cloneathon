export interface ModelSearchDefinition {
    modelName: string;
    canDoWebSearch: boolean;
    modelSearchName?: string;
}

export function getModelSearchDefinition(modelName: string){
    const def: ModelSearchDefinition = {
        modelName: modelName,
        canDoWebSearch: false,
    }

    switch(def.modelName){
        case "gpt-4o":{
            def.canDoWebSearch = true;
            def.modelSearchName = "gpt-4o-search-preview";
        }
        case "gpt-4o-mini": {
            def.canDoWebSearch = true;
            def.modelSearchName = "gpt-4o-mini-search-preview";
        }
    }

    return def;
}